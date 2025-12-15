import { Controller, Get, Inject, Post } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  @Inject(RoomService)
  private readonly roomService: RoomService;

  @Post()
  createRoom() {
    return this.roomService.createRoom('New Room');
  }

  @Get()
  getRooms() {
    return this.roomService.getRooms();
  }
}
