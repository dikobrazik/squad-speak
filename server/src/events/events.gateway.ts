import { Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  Ack,
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

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: Parameters<ClientToServerEvents['join-room']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
    @Ack() ack: (payload: { polite: boolean }) => void,
  ): void {
    const { isFirstUser } = this.roomsService.addUserToRoom(
      data.roomId,
      data.userId,
    );
    this.notifyRoomStatus(data.roomId);
    client.join([data.roomId, data.userId]);
    ack({ polite: !isFirstUser });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: Parameters<ClientToServerEvents['join-room']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
  ): void {
    this.roomsService.removeUserFromRoom(data.roomId, data.userId);
    this.notifyRoomStatus(data.roomId);
    client.leave(data.roomId);
    client.leave(data.userId);
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: Parameters<ClientToServerEvents['offer']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
    @Ack() ack: () => void,
  ): void {
    client.broadcast.emit('offer', data);
    // this.roomsService.getRoomUsersIds(data.roomId).forEach((id) => {
    //   if (data.userId !== id) {
    //     this.server.to(data.roomId).to(data.userId).emit('offer', data);
    //   }
    // });
    ack();
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: Parameters<ClientToServerEvents['answer']>[0],
    @ConnectedSocket() client: Socket<
      ClientToServerEvents,
      ServerToClientEvents
    >,
    @Ack() ack: () => void,
  ): void {
    client.broadcast.emit('answer', data);
    // this.roomsService.getRoomUsersIds(data.roomId).forEach((id) => {
    //   if (data.userId !== id) {
    //     this.server.to(data.roomId).to(data.userId).emit('answer', data);
    //   }
    // });
    ack();
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
    // this.roomsService.getRoomUsersIds(data.roomId).forEach((id) => {
    //   if (data.userId !== id) {
    //     this.server.to(data.roomId).to(data.userId).emit('ice-candidate', data);
    //   }
    // });
  }

  @Interval(1000)
  roomStatusUpdate() {
    for (const roomId of this.roomsService.ids()) {
      this.notifyRoomStatus(roomId);
    }
  }

  notifyRoomStatus(roomId: string) {
    const roomUsersCount = this.roomsService.getUsersCount(roomId);
    this.server.in(roomId).emit('room-status', { usersCount: roomUsersCount });
  }
}
