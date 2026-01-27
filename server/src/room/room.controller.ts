import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  @Inject(RoomService)
  private readonly roomService: RoomService;

  @Post()
  createRoom(@Body() body: CreateRoomDto) {
    return this.roomService.createRoom(body.name, body.password);
  }

  @Get(':id')
  getRoom(@Param('id') id: string) {
    return this.roomService
      .getRoom(id)
      .then((room) => (room ? this.roomService.marshalRoom(room) : null));
  }

  @Post(':id/check-password')
  async checkPassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    const { valid } = await this.roomService.checkPassword(id, password);

    if (!valid) {
      throw new ForbiddenException({
        message: 'Invalid password',
        error: 'invalid_password',
      });
    }
  }

  @Get()
  getRooms() {
    return this.roomService.getRooms();
  }
}
