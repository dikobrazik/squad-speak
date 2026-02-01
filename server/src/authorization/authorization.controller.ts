import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import ms from 'ms';
import { SessionStatus } from 'shared/types/session';
import { Admin } from 'src/decorators/admin.decorator';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/User';
import { TelegramAuthSessionService } from 'src/telegram/telegram-auth-session.service';
import { AuthorizationService } from './authorization.service';
import { Public } from './decorators/public.decorator';
import { AuthorizeDeviceBodyDto, AuthorizeDeviceParamsDto } from './dtos';

const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  // path: '/',
} as const;

@Controller('authorization')
export class AuthorizationController {
  @Inject(AuthorizationService)
  private readonly authService: AuthorizationService;
  @Inject(ConfigService)
  private readonly configService: ConfigService;
  @Inject(TelegramAuthSessionService)
  private readonly telegramAuthSessionService: TelegramAuthSessionService;

  @Public()
  @Get('qr')
  createQr() {
    const sessionId = this.telegramAuthSessionService.createSession();
    const botUsername = this.configService.get<string>('TELEGRAM_BOT_USERNAME');

    return {
      sessionId,
      qrUrl: `https://t.me/${botUsername}?start=login_${sessionId}`,
    };
  }

  @Post('authorize-device/:id')
  authorizeDevice(
    @Param() params: AuthorizeDeviceParamsDto,
    @Body() body: AuthorizeDeviceBodyDto,
    @User() user: UserEntity,
  ) {
    const session = this.telegramAuthSessionService.getSession(params.id);
    session.userId = user.id;
    session.rememberMe = body.rememberMe;
    session.scanned = true;

    this.telegramAuthSessionService.confirmSession(params.id);
  }

  @Public()
  @Get('/status/:id')
  async getSessionStatus(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<
    | { status: SessionStatus.EXPIRED }
    | {
        status: SessionStatus.SCANNED | SessionStatus.PENDING;
        sessionId: string;
      }
    | {
        status: SessionStatus.CONFIRMED;
        userId: string;
        accessToken: string;
      }
  > {
    const session = this.telegramAuthSessionService.getSession(id);

    if (!session) {
      return { status: SessionStatus.EXPIRED };
    }

    if (!session.confirmed) {
      if (!session.scanned) {
        return { status: SessionStatus.PENDING, sessionId: session.id };
      }

      return { status: SessionStatus.SCANNED, sessionId: session.id };
    }

    if (!session.userId) {
      throw new InternalServerErrorException('User ID is missing');
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

    response.cookie('deviceId', deviceId, {
      ...SECURE_COOKIE_OPTIONS,
      maxAge: ms('1year'),
    });

    return {
      status: SessionStatus.CONFIRMED,
      userId: session.userId,
      accessToken,
    };
  }

  @Public()
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
      if (error instanceof UnauthorizedException) {
        response.clearCookie('refreshToken');
      }

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
