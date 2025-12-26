import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class AuthorizationService {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

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
