import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  public createGuestAccount(): Promise<User> {
    const guestUser = this.userRepository.create({
      // Set default properties for a guest user
      // username: `guest_${Date.now()}`,
      // isGuest: true,
    });
    return this.userRepository.save(guestUser);
  }
}
