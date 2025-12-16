import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

type Session = {
  id: string;
  confirmed: boolean;
  telegramId?: number;
  expiresAt: number;
};

@Injectable()
export class AuthorizationService {
  private sessions = new Map<string, Session>();

  createSession() {
    const id = randomUUID();

    this.sessions.set(id, {
      id,
      confirmed: false,
      expiresAt: Date.now() + 2 * 60 * 1000, // 2 минуты
    });

    return id;
  }

  confirmSession(sessionId: string, telegramId: number) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    if (session.expiresAt < Date.now()) return false;

    session.confirmed = true;
    session.telegramId = telegramId;
    return true;
  }

  getSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) return null;
    return session;
  }
}
