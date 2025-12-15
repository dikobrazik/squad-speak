import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/entities/Room';
import type { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  @InjectRepository(Room)
  private readonly roomRepository: Repository<Room>;

  createRoom(name: string): Promise<Room> {
    const room = this.roomRepository.create({ name });
    return this.roomRepository.save(room);
  }

  getRooms(): Promise<Room[]> {
    return this.roomRepository.find();
  }
}
