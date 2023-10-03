import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // Send a welcome message to the client
    client.emit('welcome', 'Welcome to the chat!');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, @MessageBody() messageData: { message: string, senderId: string }) {
    const { message, senderId } = messageData;
    console.log(`Received message from client ${senderId}: ${message}`);

    // Broadcast the received message to all connected clients with the sender's ID
    // this.server.emit('chatMessage', { message, senderId });
    this.server.emit('chatMessage', messageData);
  }

  /*@SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, @MessageBody() message: string) {
    if (client && client.id) {
      console.log(`Received message from client ${client.id}: ${message}`);
      this.server.emit('chatMessage', message);
    }
    else
    {
      console.log(`Received message from invalid client: ${message}`);
      this.server.emit('chatMessage', message);
    }
    // Broadcast the received message to all connected clients
  }*/
}
