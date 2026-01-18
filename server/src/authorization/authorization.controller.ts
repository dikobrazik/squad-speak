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
import ms from 'ms';
import { interval, map, Observable } from 'rxjs';
import { SessionStatus } from 'shared/types/session';
import { Admin } from 'src/decorators/admin.decorator';
import { TelegramAuthSessionService } from 'src/telegram/telegram-auth-session.service';
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
  @Inject(TelegramAuthSessionService)
  private readonly telegramAuthSessionService: TelegramAuthSessionService;

  @Post('guest')
  async createGuestAccount() {
    const guestUser = await this.userService.createGuestAccount();
    return guestUser;
  }

  @Get('qr')
  createQr() {
    const sessionId = this.telegramAuthSessionService.createSession();
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
        const session = this.telegramAuthSessionService.getSession(id);

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
    const session = this.telegramAuthSessionService.getSession(id);

    if (!session) {
      return new NotFoundException();
    }

    if (!session.userId) {
      return new InternalServerErrorException('User ID is missing');
    }
    const rememberMe = session.rememberMe || false;

    const { refreshToken, sessionId, deviceId } =
      await this.authService.generateRefreshToken(session.userId, rememberMe);

    const accessToken = await this.authService.generateAccessToken(
      session.userId,
      sessionId,
    );

    response.cookie('refreshToken', refreshToken, {
      ...SECURE_COOKIE_OPTIONS,
      maxAge: rememberMe ? ms('100d') : ms('3h'),
    });
    response.cookie('deviceId', deviceId, SECURE_COOKIE_OPTIONS);

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

    const refreshToken = request.cookies['refreshToken'];
    const deviceId = request.cookies['deviceId'];

    try {
      ({ userId } = await this.authService.validateRefreshToken(
        refreshToken,
        deviceId,
      ));
    } catch (error) {
      response.clearCookie('refreshToken');
      throw error;
    }

    const accessToken = await this.authService.generateAccessToken(
      userId,
      '5m',
    );

    return {
      userId,
      accessToken,
    };
  }

  @Admin()
  @Get('admin/check')
  checkAdminRole() {
    return { message: 'Admin role verified' };
  }
}
