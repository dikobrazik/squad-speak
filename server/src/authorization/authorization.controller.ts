import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  MessageEvent,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { interval, map, Observable } from 'rxjs';
import { SessionStatus } from 'shared/types/session';
import { UserService } from 'src/user/user.service';
import { AuthorizationService } from './authorization.service';
import { Public } from './decorators/public.decorator';

const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  // path: '/',
} as const;

@Public()
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
    const botUsername = this.configService.getOrThrow<string>(
      'TELEGRAM_BOT_USERNAME',
    );

    return {
      sessionId,
      qrUrl: `https://t.me/${botUsername}?start=login_${sessionId}`,
    };
  }

  @Sse('status/stream/:id')
  getStatus(@Param('id') id: string): Observable<MessageEvent> {
    return interval(1000).pipe(
      map(() => {
        const session = this.authService.getSession(id);

        if (!session) {
          return { status: SessionStatus.EXPIRED };
        }

        if (!session.scanned) {
          return { status: SessionStatus.PENDING };
        }

        if (!session.confirmed) {
          return { status: SessionStatus.SCANNED };
        }

        return { status: SessionStatus.CONFIRMED };
      }),
      map((data) => ({ data })),
    );
  }

  @Get('/status/:id')
  async getSessionStatus(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = this.authService.getSession(id);
    if (!session) {
      return new NotFoundException();
    }

    if (!session.userId) {
      return new InternalServerErrorException('User ID is missing');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.generateJwtToken(session.userId),
      this.authService.generateJwtToken(session.userId, '7d'),
    ]);

    response.cookie('refreshToken', refreshToken, SECURE_COOKIE_OPTIONS);

    return {
      telegramId: session.telegramId,
      userId: session.userId,
      accessToken,
    };
  }

  @Get('/refresh')
  async getAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    let userId: string;

    try {
      ({ userId } = await this.authService.validateRefreshToken(
        request.cookies['refreshToken'],
      ));
    } catch (error) {
      response.clearCookie('refreshToken');
      throw error;
    }

    console.log(userId);

    const accessToken = await this.authService.generateJwtToken(userId, '5m');

    return {
      userId,
      accessToken,
    };
  }
}
