import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TelegramAccount } from 'src/entities/TelegramAccount';
import { User } from 'src/entities/User';
import { TelegramBotService } from './bot/telegram-bot.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramAuthSessionService } from './telegram-auth-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramAccount, User]), HttpModule],
  providers: [TelegramService, TelegramBotService, TelegramAuthSessionService],
  controllers: [TelegramController],
  exports: [TelegramService, TelegramAuthSessionService],
})
export class TelegramModule {}
