import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class AuthorizationService {
  @Inject(JwtService)
  private readonly jwtService: JwtService;
  @Inject(SessionService)
  private readonly sessionService: SessionService;

  public generateAccessToken(userId: string, sessionId: string) {
    return this.jwtService.signAsync(
      { sub: userId, sid: `session_${sessionId}` },
      { expiresIn: '5m' },
    );
  }

  public generateRefreshToken(userId: string, rememberMe: boolean) {
    return this.sessionService.createSession(userId, rememberMe);
  }

  public async validateRefreshToken(
    token: string | undefined,
    deviceId: string,
  ) {
    if (!token) {
      throw new UnauthorizedException({
        message: 'No refresh token provided',
        error: 'no_refresh_token',
      });
    }

    const session = await this.sessionService.getSessionForToken(
      token,
      deviceId,
    );

    if (!session) {
      throw new UnauthorizedException({
        message: 'Token is invalid',
        error: 'refresh_token_invalid',
      });
    }

    if (session.expires_at < new Date()) {
      throw new UnauthorizedException({
        message: 'Refresh token is expired',
        error: 'refresh_token_expired',
      });
    }

    return { userId: session.user_id };
  }
}
