import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'crypto';
import { Room } from 'src/entities/Room';
import { RoomStateService } from 'src/room/rooms-state.service';
import type { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  @InjectRepository(Room)
  private readonly roomRepository: Repository<Room>;
  @Inject(RoomStateService)
  private readonly roomStateService: RoomStateService;

  createRoom(name: string, password: string): Promise<Room> {
    const passwordHash = RoomService.hash(password);

    const room = this.roomRepository.create({ name, passwordHash });
    return this.roomRepository.save(room);
  }

  getRoom(roomId: string): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { id: roomId } });
  }

  async checkPassword(roomId: string, password: string) {
    const room = await this.getRoom(roomId);

    if (!room) {
      return { valid: false };
    }

    const passwordHash = RoomService.hash(password);

    if (room.passwordHash && room.passwordHash !== passwordHash) {
      return { valid: false };
    }

    return { valid: true };
  }

  getRooms(): Promise<(Room & { protected: boolean })[]> {
    return this.roomRepository
      .find()
      .then((rooms) =>
        rooms.map((room) => ({
          ...room,
          usersIdsInRoom: this.roomStateService.getRoomUsersIds(room.id),
        })),
      )
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
    if (!password) return '';

    return hash('sha256', password);
  }
}
