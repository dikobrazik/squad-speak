import { Module } from '@nestjs/common';
import { RoomModule } from 'src/room/room.module';
import { EventsGateway } from './events.gateway';
import { MultiUserEventsGateway } from './multi-user-events.gateway';
import { RoomStateService } from './rooms.service';

@Module({
  imports: [RoomModule],
  providers: [EventsGateway, MultiUserEventsGateway, RoomStateService],
})
export class EventsModule {}
