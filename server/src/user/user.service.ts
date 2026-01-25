import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  public createUser(): Promise<User> {
    const user = this.userRepository.create({});

    return this.userRepository.save(user);
  }

  public getUser(userId: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id: userId });
  }
}
