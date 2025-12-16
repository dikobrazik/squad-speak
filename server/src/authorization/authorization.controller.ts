import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthorizationService } from './authorization.service';

@Controller('authorization')
export class AuthorizationController {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(AuthorizationService)
  private readonly authService: AuthorizationService;
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Post('guest')
  async createGuestAccount() {
    const guestUser = await this.userService.createGuestAccount();
    return guestUser;
  }

  @Get('qr')
  createQr() {
    const sessionId = this.authService.createSession();

    return {
      sessionId,
      qrUrl: `https://t.me/${this.configService.getOrThrow<string>('TELEGRAM_BOT_USERNAME')}?start=login_${sessionId}`,
    };
  }

  @Get('status/:id')
  getStatus(@Param('id') id: string) {
    const session = this.authService.getSession(id);

    if (!session) {
      return { status: 'expired' };
    }

    if (!session.confirmed) {
      return { status: 'pending' };
    }

    return {
      status: 'confirmed',
      telegramId: session.telegramId,
      // здесь можно вернуть JWT
    };
  }
}
