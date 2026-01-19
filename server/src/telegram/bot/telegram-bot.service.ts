import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup, Telegraf } from 'telegraf';
import { TelegramService } from '../telegram.service';
import { TelegramAuthSessionService } from '../telegram-auth-session.service';

@Injectable()
export class TelegramBotService {
  @Inject(TelegramAuthSessionService)
  private readonly telegramAuthSessionService: TelegramAuthSessionService;
  @Inject(TelegramService)
  private readonly telegramService: TelegramService;

  private bot: Telegraf<Context>;
  private botToken: string;

  constructor(private readonly configService: ConfigService) {
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
      const session = this.telegramAuthSessionService.getSession(sessionId);

      if (session) {
        session.scanned = true;
        session.rememberMe = rememberMe;
      } else {
        return ctx.reply('❌ Сессия устарела или недействительна');
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

      await this.telegramService.linkTelegramAccount(sessionId, ctx.from);

      const ok = this.telegramAuthSessionService.confirmSession(sessionId);

      if (!ok) {
        return ctx.reply('❌ Сессия устарела или недействительна');
      }

      return ctx.reply('✅ Вход выполнен. Можешь закрыть Telegram.');
    });

    return this.bot.createWebhook({
      domain: this.configService.getOrThrow<string>('TELEGRAM_WEBHOOK_URL'),
    });
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
      throw new NotFoundException({
        message: 'Photo not found',
        error: 'photo_not_found',
      });
    }
  }
}
