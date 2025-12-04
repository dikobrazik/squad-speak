import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomsService } from './rooms.service';

@Module({
  providers: [EventsGateway, RoomsService],
})
export class EventsModule {}
