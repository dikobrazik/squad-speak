import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  SingleRoomClientToServerEvents,
  SingleRoomServerToClientEvents,
} from 'shared/types/websockets/single-room';
import type { Server, Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { RoomStateService } from './rooms-state.service';

@WebSocketGateway(808, {
  cors: {
    origin: ['http://localhost:3000', 'https://squadspeak.ru'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway {
  @Inject(RoomStateService)
  private roomStateService: RoomStateService;

  @Inject(RoomService)
  private roomService: RoomService;

  @WebSocketServer() server: Server<
    SingleRoomClientToServerEvents,
    SingleRoomServerToClientEvents
  >;

  async handleConnection(
    @ConnectedSocket() client: Socket<
      SingleRoomClientToServerEvents,
      SingleRoomServerToClientEvents
    >,
  ) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    if ((await this.roomService.getRoom(roomId)) === null) {
      client.emit('room-not-found');
      client.disconnect();
      return;
    }

    const usersInRoom = this.roomStateService.getUsersCount(roomId);

    switch (usersInRoom) {
      case 0:
        break;
      case 1:
        client.broadcast.emit('start-call');
        break;
      default:
        client.emit('room-full');
        client.disconnect();
        return;
    }

    this.roomStateService.addUserToRoom(roomId, userId);
    client.join(roomId);
    this.notifyRoomStatus(roomId);
  }

  handleDisconnect(
    @ConnectedSocket() client: Socket<
      SingleRoomClientToServerEvents,
      SingleRoomServerToClientEvents
    >,
  ) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    this.roomStateService.removeUserFromRoom(roomId, userId);
    client.leave(roomId);
    this.notifyRoomStatus(roomId);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: Parameters<SingleRoomClientToServerEvents['offer']>[0],
    @ConnectedSocket() client: Socket<
      SingleRoomClientToServerEvents,
      SingleRoomServerToClientEvents
    >,
  ): void {
    client.broadcast.emit('offer', data);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: Parameters<
      SingleRoomClientToServerEvents['answer']
    >[0],
    @ConnectedSocket() client: Socket<
      SingleRoomClientToServerEvents,
      SingleRoomServerToClientEvents
    >,
  ): void {
    client.broadcast.emit('answer', data);
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: Parameters<
      SingleRoomClientToServerEvents['ice-candidate']
    >[0],
    @ConnectedSocket() client: Socket<
      SingleRoomClientToServerEvents,
      SingleRoomServerToClientEvents
    >,
  ): void {
    client.broadcast.emit('ice-candidate', data);
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
