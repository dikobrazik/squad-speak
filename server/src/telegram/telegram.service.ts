import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { TelegramAccount } from 'src/entities/TelegramAccount';
import { User } from 'src/entities/User';
import { UserService } from 'src/user/user.service';
import { Context, Markup, Telegraf } from 'telegraf';
import { User as TelegramUser } from 'telegraf/types';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramService {
  @InjectRepository(TelegramAccount)
  private readonly telegramAccountRepository: Repository<TelegramAccount>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  private bot: Telegraf<Context>;
  private botToken: string;

  constructor(
    @Inject(forwardRef(() => AuthorizationService))
    private readonly authService: AuthorizationService,
    private readonly configService: ConfigService,
  ) {
    this.botToken = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

    this.bot = new Telegraf(
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
    );
  }

  createBot() {
    this.bot.start(async (ctx) => {
      console.log('Start command received:', ctx.payload);
      let payload = ctx.payload;

      if (!payload?.startsWith('login_')) {
        return ctx.reply('Привет! Это бот авторизации.');
      }

      const rememberMe = payload.endsWith('_rememberMe');

      if (rememberMe) {
        payload = payload.replace('_rememberMe', '');
      }

      const sessionId = payload.replace('login_', '');
      const session = this.authService.getSession(sessionId);

      if (session) {
        session.scanned = true;
      }

      await ctx.reply(
        'Подтвердить вход в приложение?',
        Markup.inlineKeyboard([
          Markup.button.callback(
            `✅ Подтвердить ${rememberMe ? '(запомнить)' : ''}`,
            `confirm_${sessionId}`,
          ),
        ]),
      );
    });

    this.bot.action(/confirm_(.+)/, async (ctx) => {
      console.log('Action received:', ctx.match[0]);

      const sessionId = ctx.match[1];
      const telegramId = ctx.from.id;

      const ok = await this.authService.confirmSession(sessionId, telegramId);

      if (!ok) {
        return ctx.reply('❌ Сессия устарела или недействительна');
      }

      await this.linkTelegramAccount(sessionId, ctx.from);

      await ctx.reply('✅ Вход выполнен. Можешь закрыть Telegram.');
      await ctx.answerCbQuery();
    });

    return this.bot.createWebhook({
      domain: this.configService.getOrThrow<string>('TELEGRAM_WEBHOOK_URL'),
    });
  }

  private async linkTelegramAccount(sessionId: string, user: TelegramUser) {
    const telegramId = user.id;
    const username = user.username;
    const firstName = user.first_name;
    const lastName = user.last_name;

    const session = this.authService.getSession(sessionId);
    if (!session || session.telegramId !== telegramId) {
      throw new NotFoundException('Session not found or mismatched telegramId');
    }

    let account = await this.telegramAccountRepository.findOneBy({
      id: String(telegramId),
    });

    if (account) {
      // Update existing account
      account.username = username || '';
      account.name = `${firstName} ${lastName}`.trim();
    } else {
      const user = this.userRepository.create();

      const userEntity = await this.userRepository.save(user);

      // Create new account
      account = this.telegramAccountRepository.create({
        id: String(telegramId),
        username: username || '',
        name: `${firstName} ${lastName}`.trim(),
        user_id: userEntity.id,
      });
    }

    session.userId = account.user_id;

    await this.telegramAccountRepository.save(account);
  }

  public getProfile(userId: string) {
    return this.telegramAccountRepository.findOneBy({ user_id: userId });
  }

  public async getProfilePhoto(telegramId: number) {
    const photos = await this.bot.telegram.getUserProfilePhotos(telegramId);

    if (photos.total_count > 0 && photos.photos.length > 0) {
      const smallestPhoto = photos.photos[0][0];
      // const largestPhoto = photos.photos[0][photos.photos[0].length - 1];
      const fileId = smallestPhoto.file_id;

      const file = await this.bot.telegram.getFile(fileId);
      const filePath = file.file_path;

      return `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
    } else {
      throw new NotFoundException();
    }
  }
}
