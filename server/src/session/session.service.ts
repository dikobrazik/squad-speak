import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import ms from 'ms';
import { Session } from 'src/entities/Session';
import { LessThan, MoreThan, Repository } from 'typeorm';
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

  public async getActiveSessions(userId: string) {
    const sessions = await this.sessionRepository.find({
      where: { user_id: userId, expires_at: MoreThan(new Date()) },
      order: { last_used_at: 'DESC' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceId: session.device_id,
      createdAt: session.created_at,
      lastActiveAt: session.last_used_at,
    }));
  }

  public removeSession(sessionId: string) {
    return this.sessionRepository.delete({
      id: sessionId,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  handleCron() {
    this.sessionRepository
      .delete({
        expires_at: LessThan(new Date()),
      })
      .then((result) => {
        console.log(`Deleted ${result.affected} expired sessions`);
      });
  }
}
