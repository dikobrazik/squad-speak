import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TelegramAccount } from 'src/entities/TelegramAccount';
import { User } from 'src/entities/User';
import { User as TelegramUser } from 'telegraf/types';
import { Repository } from 'typeorm';
import { TelegramAuthSessionService } from './telegram-auth-session.service';

@Injectable()
export class TelegramService {
  @InjectRepository(TelegramAccount)
  private readonly telegramAccountRepository: Repository<TelegramAccount>;
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(TelegramAuthSessionService)
  private readonly telegramAuthSessionService: TelegramAuthSessionService;

  public async linkTelegramAccount(sessionId: string, user: TelegramUser) {
    const telegramId = user.id;
    const username = user.username;
    const firstName = user.first_name ?? '';
    const lastName = user.last_name ?? '';

    const session = this.telegramAuthSessionService.getSession(sessionId);
    if (!session || session.telegramId !== telegramId) {
      throw new NotFoundException({
        message: 'Session not found or mismatched telegramId',
        error: 'telegram_auth_session_not_found',
      });
    }

    let account = await this.telegramAccountRepository.findOneBy({
      id: String(telegramId),
    });

    if (account) {
      // Update existing account
      account.username = username || '';
      account.name = `${firstName} ${lastName}`.trim();

      session.userId = account.user_id;
    } else {
      const user = this.userRepository.create();

      const userEntity = await this.userRepository.save(user);

      // Create new account
      account = this.telegramAccountRepository.create({
        id: String(telegramId),
        username: username || '',
        name: `${firstName} ${lastName}`.trim(),
        user_id: userEntity.id,
      });

      session.userId = userEntity.id;
    }

    console.log('telegram account:', account);

    await this.telegramAccountRepository.save(account);
  }

  public getProfile(userId: string) {
    return this.telegramAccountRepository.findOneBy({ user_id: userId });
  }

  public getAccounts() {
    return this.telegramAccountRepository.find();
  }
}
