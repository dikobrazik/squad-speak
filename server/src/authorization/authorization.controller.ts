import { Controller, Inject, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Controller('authorization')
export class AuthorizationController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Post('guest')
  async createGuestAccount() {
    const guestUser = await this.userService.createGuestAccount();
    return guestUser;
  }
}
