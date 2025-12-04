import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TurnController } from './turn.controller';
import { TurnService } from './turn.service';

@Module({
  imports: [HttpModule],
  providers: [TurnService],
  controllers: [TurnController],
})
export class TurnModule {}
