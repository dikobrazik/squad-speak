import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [UserModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, JwtStrategy],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
