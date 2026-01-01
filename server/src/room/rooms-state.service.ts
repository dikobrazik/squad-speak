import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomStateService {
  private roomsMap: Record<
    string,
    { users: Record<string, { muted: boolean }> }
  > = {};

  addUserToRoom(roomId: string, userId: string) {
    if (!this.roomsMap[roomId]) {
      this.roomsMap[roomId] = { users: {} };
    }
    this.roomsMap[roomId].users[userId] = { muted: false };
  }

  removeUserFromRoom(roomId: string, userId: string) {
    if (this.roomsMap[roomId]) {
      delete this.roomsMap[roomId].users[userId];
      if (Object.keys(this.roomsMap[roomId].users).length === 0) {
        delete this.roomsMap[roomId];
      }
    }
  }

  muteUserInRoom(roomId: string, userId: string) {
    if (this.roomsMap[roomId] && this.roomsMap[roomId].users[userId]) {
      this.roomsMap[roomId].users[userId].muted = true;
    }
  }

  unmuteUserInRoom(roomId: string, userId: string) {
    if (this.roomsMap[roomId] && this.roomsMap[roomId].users[userId]) {
      this.roomsMap[roomId].users[userId].muted = false;
    }
  }

  getRoomUsersIds(roomId: string) {
    return Object.keys(this.roomsMap[roomId]?.users || {});
  }

  ids() {
    return Object.keys(this.roomsMap);
  }

  getUsersCount(roomId: string): number {
    return this.roomsMap[roomId]
      ? Object.keys(this.roomsMap[roomId].users).length
      : 0;
  }
}
