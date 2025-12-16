import { Module } from '@nestjs/common';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TelegramService } from './telegram.service';

@Module({
  imports: [AuthorizationModule],
  providers: [TelegramService],
})
export class TelegramModule {}
