import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class RoomStateService {
  private roomsMap: Record<string, { users: Record<string, boolean> }> = {};

  addUserToRoom(roomId: string, userId: string) {
    let isFirstUser = false;
    if (!this.roomsMap[roomId]) {
      this.roomsMap[roomId] = { users: {} };
      isFirstUser = true;
    }
    this.roomsMap[roomId].users[userId] = true;
    return { isFirstUser };
  }

  removeUserFromRoom(roomId: string, userId: string) {
    if (this.roomsMap[roomId]) {
      delete this.roomsMap[roomId].users[userId];
      if (Object.keys(this.roomsMap[roomId].users).length === 0) {
        delete this.roomsMap[roomId];
      }
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
