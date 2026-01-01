import { Module } from '@nestjs/common';
import { RoomModule } from 'src/room/room.module';
import { MultiUserEventsGateway } from './multi-user-events.gateway';

@Module({
  imports: [RoomModule],
  providers: [MultiUserEventsGateway],
})
export class EventsModule {}
