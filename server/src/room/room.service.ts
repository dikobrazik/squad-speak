import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'crypto';
import { Room } from 'src/entities/Room';
import type { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  @InjectRepository(Room)
  private readonly roomRepository: Repository<Room>;

  createRoom(name: string, password: string): Promise<Room> {
    const passwordHash = RoomService.hash(password);

    const room = this.roomRepository.create({ name, passwordHash });
    return this.roomRepository.save(room);
  }

  getRoom(roomId: string): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { id: roomId } });
  }

  getRooms(): Promise<(Room & { protected: boolean })[]> {
    return this.roomRepository
      .find()
      .then((rooms) => rooms.map(this.marshalRoom));
  }

  public marshalRoom(room: Room) {
    return {
      ...room,
      protected: Boolean(room.passwordHash),
      passwordHash: '',
    };
  }

  static hash(password: string): string {
    return hash('sha256', password);
  }
}
