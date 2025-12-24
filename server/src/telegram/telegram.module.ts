import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { TelegramAccount } from 'src/entities/TelegramAccount';
import { User } from 'src/entities/User';
import { UserModule } from 'src/user/user.module';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    AuthorizationModule,
    TypeOrmModule.forFeature([TelegramAccount, User]),
    HttpModule,
  ],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
