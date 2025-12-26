import { Controller, Inject, Post } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { User as UserEntity } from 'src/entities/User';
import { TurnService } from './turn.service';

@Controller('turn')
export class TurnController {
  @Inject(TurnService)
  private readonly turnService: TurnService;

  @Post('credentials')
  getCredentials(@User() user: UserEntity) {
    return this.turnService.getTurnCredentials(user.id);
  }
}
