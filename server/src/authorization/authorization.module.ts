import { Module } from '@nestjs/common';
import { SessionModule } from 'src/session/session.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { UserModule } from 'src/user/user.module';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [SessionModule, UserModule, TelegramModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, JwtStrategy],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
