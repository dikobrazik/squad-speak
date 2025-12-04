import { Controller, Inject, Post } from '@nestjs/common';
import { TurnService } from './turn.service';

@Controller('turn')
export class TurnController {
  @Inject(TurnService)
  private readonly turnService: TurnService;

  @Post('credentials')
  getCredentials() {
    return this.turnService.getTurnCredentials();
  }
}
