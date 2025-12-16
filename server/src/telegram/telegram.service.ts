import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { Context, Markup, Telegraf } from 'telegraf';
import { Update } from 'telegraf/types';

@Injectable()
export class TelegramService {
  private bot: Telegraf<Context>;

  constructor(
    private readonly authService: AuthorizationService,
    private readonly configService: ConfigService,
  ) {
    this.bot = new Telegraf(
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
    );
  }

  createBot() {
    this.bot.start(async (ctx) => {
      console.log('Start command received:', ctx.payload);
      const payload = ctx.payload;

      if (!payload?.startsWith('login_')) {
        return ctx.reply('Привет! Это бот авторизации.');
      }

      const sessionId = payload.replace('login_', '');

      await ctx.reply(
        'Подтвердить вход в приложение?',
        Markup.inlineKeyboard([
          Markup.button.callback('✅ Подтвердить', `confirm_${sessionId}`),
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

      await ctx.reply('✅ Вход выполнен. Можешь закрыть Telegram.');
      await ctx.answerCbQuery();
    });

    return this.bot.createWebhook({
      domain: this.configService.getOrThrow<string>('TELEGRAM_WEBHOOK_URL'),
    });
  }
}
