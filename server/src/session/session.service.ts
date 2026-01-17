import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import ms from 'ms';
import { Session } from 'src/entities/Session';
import { Repository } from 'typeorm';
import { generateRefreshToken, hashToken } from './utils';

@Injectable()
export class SessionService {
  @InjectRepository(Session)
  private readonly sessionRepository: Repository<Session>;

  public async createSession(
    userId: string,
    rememberMe: boolean,
  ): Promise<{ refreshToken: string; sessionId: string; deviceId: string }> {
    const refreshToken = generateRefreshToken();
    const deviceId = randomUUID();

    const expiryDuration = ms(rememberMe ? '30d' : '3h');

    const session = this.sessionRepository.create({
      last_used_at: new Date(),
      user_id: userId,
      token_hash: hashToken(refreshToken),
      expires_at: new Date(Date.now() + expiryDuration),
      device_id: deviceId,
    });

    await this.sessionRepository.save(session);

    return { refreshToken, sessionId: session.id, deviceId };
  }

  public async getSessionForToken(
    token: string,
    deviceId: string,
  ): Promise<Session | null> {
    const tokenHash = hashToken(token);

    const session = await this.sessionRepository.findOne({
      where: { device_id: deviceId, token_hash: tokenHash },
    });

    if (!session) {
      return session;
    }

    this.sessionRepository.update(session.id, {
      last_used_at: new Date(),
    });

    return session;
  }
}
