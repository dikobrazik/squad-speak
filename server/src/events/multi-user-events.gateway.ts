import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from 'shared/types/websockets/multi-room';
import type { Server, Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { RoomStateService } from '../room/rooms-state.service';

type Client = Socket<
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents
>;

@WebSocketGateway(808, {
  namespace: 'multiuser',
  cors: {
    origin: ['http://localhost:3000', 'https://squadspeak.ru'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class MultiUserEventsGateway {
  @Inject(RoomStateService)
  private roomStateService: RoomStateService;
  @Inject(RoomService)
  private roomService: RoomService;

  @WebSocketServer() server: Server<
    MultiRoomClientToServerEvents,
    MultiRoomServerToClientEvents
  >;

  async handleConnection(@ConnectedSocket() client: Client) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    const room = await this.roomService.getRoom(roomId);

    if (room === null) {
      client.emit('room-not-found');
      client.disconnect();
      return;
    }

    if (room.passwordHash) {
      const providedPassword = String(client.handshake.auth.password || '');
      const providedPasswordHash = RoomService['hash'](providedPassword);

      if (providedPasswordHash !== room.passwordHash) {
        client.emit('invalid-password');
        client.disconnect();
        return;
      }
    }

    const usersInRoom = this.roomStateService.getUsersCount(roomId);

    if (usersInRoom > 0) {
      client.emit('start-call', [
        ...this.roomStateService.getRoomUsersIds(roomId),
      ]);
    }

    this.roomStateService.addUserToRoom(roomId, userId);
    this.server.to(roomId).emit('connected', { userId });
    client.join(roomId);
    this.notifyRoomStatus(roomId);
  }

  handleDisconnect(@ConnectedSocket() client: Client) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    this.roomStateService.removeUserFromRoom(roomId, userId);
    this.server.to(roomId).emit('disconnected', { userId });
    client.leave(roomId);
    this.notifyRoomStatus(roomId);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: Parameters<MultiRoomClientToServerEvents['offer']>[0],
    @ConnectedSocket() client: Client,
  ): void {
    client.to(String(client.handshake.query.roomId)).emit('offer', data);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: Parameters<MultiRoomClientToServerEvents['answer']>[0],
    @ConnectedSocket() client: Client,
  ): void {
    client.to(String(client.handshake.query.roomId)).emit('answer', data);
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: Parameters<
      MultiRoomClientToServerEvents['ice-candidate']
    >[0],
    @ConnectedSocket() client: Client,
  ): void {
    client
      .to(String(client.handshake.query.roomId))
      .emit('ice-candidate', data);
  }

  // @Interval(1000)
  // roomStatusUpdate() {
  //   for (const roomId of this.roomsService.ids()) {
  //     this.notifyRoomStatus(roomId);
  //   }
  // }

  notifyRoomStatus(roomId: string) {
    const roomUsersCount = this.roomStateService.getUsersCount(roomId);
    this.server.in(roomId).emit('room-status', { usersCount: roomUsersCount });
  }
}
