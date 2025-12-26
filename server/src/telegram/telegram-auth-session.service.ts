import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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
}
