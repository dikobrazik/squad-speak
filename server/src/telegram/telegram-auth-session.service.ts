import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import ms from 'ms';

type Session = {
  id: string;
  scanned: boolean;
  confirmed: boolean;
  telegramId?: number;
  expiresAt: number;
  userId?: string;
  rememberMe?: boolean;
};

@Injectable()
export class TelegramAuthSessionService {
  private sessions = new Map<string, Session>();

  createSession() {
    const id = randomUUID();

    this.sessions.set(id, {
      id,
      scanned: false,
      confirmed: false,
      expiresAt: Date.now() + ms('10m'),
    });

    return id;
  }

  confirmSession(sessionId: string) {
    const session = this.getSession(sessionId);
    session.confirmed = true;
    return true;
  }

  setSessionTelegramId(sessionId: string, telegramId: number) {
    const session = this.getSession(sessionId);
    session.telegramId = telegramId;
    return true;
  }

  getSession(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (!session) throw new Error('Session not found');

    if (session.expiresAt < Date.now()) throw new Error('Session expired');

    return session;
  }

  markSessionScanned(sessionId: string) {
    const session = this.getSession(sessionId);
    session.scanned = true;
  }
}
