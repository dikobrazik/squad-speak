import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MultiUserEventsGateway } from './multi-user-events.gateway';
import { RoomsService } from './rooms.service';

@Module({
  providers: [EventsGateway, MultiUserEventsGateway, RoomsService],
})
export class EventsModule {}
