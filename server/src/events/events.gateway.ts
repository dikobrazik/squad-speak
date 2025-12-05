import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';

@WebSocketGateway(808, {
  cors: {
    origin: ['http://localhost:3000', 'https://squadspeak.ru'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any): void {
    // Handle WebRTC offer, potentially forwarding to another peer
    this.server.emit('offer', data); // Example: broadcasting offer
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any): void {
    // Handle WebRTC answer
    this.server.emit('answer', data); // Example: broadcasting answer
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(@MessageBody() data: any): void {
    // Handle ICE candidates
    this.server.emit('ice-candidate', data); // Example: broadcasting candidate
  }
}
