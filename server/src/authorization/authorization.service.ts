import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

type Session = {
  id: string;
  scanned: boolean;
  confirmed: boolean;
  telegramId?: number;
  expiresAt: number;
  userId?: string;
};

@Injectable()
export class AuthorizationService {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  private sessions = new Map<string, Session>();

  createSession() {
    const id = randomUUID();

    this.sessions.set(id, {
      id,
      scanned: false,
      confirmed: false,
      expiresAt: Date.now() + 2 * 60 * 1000, // 2 минуты
    });

    return id;
  }

  confirmSession(sessionId: string, telegramId: number) {
    const session = this.getSession(sessionId);
    if (!session) return false;

    session.confirmed = true;
    session.telegramId = telegramId;
    return true;
  }

  getSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) return null;
    return session;
  }

  markSessionScanned(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.scanned = true;
    }
  }

  public generateJwtToken(
    userId: string,
    expiresIn?: JwtSignOptions['expiresIn'],
  ) {
    return this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: expiresIn || '1h' },
    );
  }

  public async validateRefreshToken(token: string) {
    let userId: string;
    try {
      ({ sub: userId } = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
      }));
    } catch (error) {
      console.log(error);

      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: 'Refresh token is expired',
          error: 'refresh_token_expired',
        });
      }

      throw new UnauthorizedException({
        message: 'Token is invalid',
        error: 'refresh_token_invalid',
      });
    }

    // const session = await this.sessionService.getSession(token, deviceId);

    // if (!session) {
    //   throw new UnauthorizedException({
    //     message: 'Where is no such session',
    //     error: 'no_session',
    //   });
    // }

    return { userId };
  }
}
