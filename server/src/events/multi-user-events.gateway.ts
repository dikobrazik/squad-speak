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
import { RoomsService } from './rooms.service';

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
  @Inject(RoomsService)
  private roomsService: RoomsService;

  @WebSocketServer() server: Server<
    MultiRoomClientToServerEvents,
    MultiRoomServerToClientEvents
  >;

  handleConnection(@ConnectedSocket() client: Client) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    const usersInRoom = this.roomsService.getUsersCount(roomId);

    if (usersInRoom > 0) {
      client.emit('start-call', [...this.roomsService.getRoomUsersIds(roomId)]);
    }

    this.roomsService.addUserToRoom(roomId, userId);
    this.server.to(roomId).emit('connected', { userId });
    client.join(roomId);
    this.notifyRoomStatus(roomId);
  }

  handleDisconnect(@ConnectedSocket() client: Client) {
    const roomId = String(client.handshake.query.roomId);
    const userId = String(client.handshake.auth.userId);

    this.roomsService.removeUserFromRoom(roomId, userId);
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
    const roomUsersCount = this.roomsService.getUsersCount(roomId);
    this.server.in(roomId).emit('room-status', { usersCount: roomUsersCount });
  }
}
