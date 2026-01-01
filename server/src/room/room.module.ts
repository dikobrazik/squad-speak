import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from 'src/entities/Room';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomStateService } from './rooms-state.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  providers: [RoomService, RoomStateService],
  controllers: [RoomController],
  exports: [RoomService, RoomStateService],
})
export class RoomModule {}
