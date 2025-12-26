import { HttpService } from '@nestjs/axios';
import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from 'src/authorization/decorators/public.decorator';
import { TelegramBotService } from './bot/telegram-bot.service';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  @Inject(HttpService)
  private readonly httpService: HttpService;
  @Inject(TelegramService)
  private readonly telegramService: TelegramService;
  @Inject(TelegramBotService)
  private readonly telegramBotService: TelegramBotService;

  @Get('profile/:id')
  getProfile(@Param('id') id: string) {
    return this.telegramService.getProfile(id);
  }

  @Public()
  @Get('profile/:id/photo')
  async getProfilePhoto(@Res() res: Response, @Param('id') id: string) {
    const telegramAccount = await this.telegramService.getProfile(id);
    if (!telegramAccount) {
      res.status(404).send('No Telegram account linked');
      return;
    }

    const photoUrl = await this.telegramBotService.getProfilePhoto(
      Number(telegramAccount.id),
    );

    this.httpService.get(photoUrl, { responseType: 'stream' }).subscribe({
      next(response) {
        response.data.pipe(res);
      },
      error(err) {
        res.status(500).send('Error fetching photo');
      },
    });
  }
}
