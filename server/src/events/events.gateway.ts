import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'shared/types/websockets';
import type { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';

@WebSocketGateway(808, {
  cors: {
    origin: ['http://localhost:3000', 'https://squadspeak.ru'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway {
  @Inject(RoomsService)
  private roomsService: RoomsService;

  @WebSocketServer() server: Server<ClientToServerEvents, ServerToClientEvents>;

  handleConnection(
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
  ) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    this.roomsService.addUserToRoom(roomId, userId);
    this.notifyRoomStatus(roomId);
    client.join(roomId);
  }

  handleDisconnect(
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
  ) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    this.roomsService.removeUserFromRoom(roomId, userId);
    this.notifyRoomStatus(roomId);
    client.leave(roomId);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: Parameters<ClientToServerEvents['offer']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
  ): void {
    client.broadcast.emit('offer', data);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: Parameters<ClientToServerEvents['answer']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
  ): void {
    client.broadcast.emit('answer', data);
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: Parameters<ClientToServerEvents['ice-candidate']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
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
    const roomUsersCount = this.roomsService.getUsersCount(roomId);
    this.server.in(roomId).emit('room-status', { usersCount: roomUsersCount });
  }
}
