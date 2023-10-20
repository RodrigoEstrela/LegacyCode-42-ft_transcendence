import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Access the WebSocket handshake headers to retrieve cookies
    const headers = client.handshake.headers;
    const cookies = cookie.parse(headers.cookie || '');

    // Example: Access a specific cookie (e.g., 'userId')
    const userId = cookies.user;

    // You can now use 'userId' or any other cookie information for user identification or authorization
    // console.log(`User ID from cookie: ${userId}`);

    // Send a welcome message to the client
    client.emit('welcome', 'Welcome to the chat!');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(client: Socket, @MessageBody() messageData: { message: string, senderId: string, cookieData: Record<string, string>, senderName: string}) {
    const { message, senderId, cookieData, senderName} = messageData;
    console.log(`Received message from client ${senderId}: ${message}`);
    // Access and log the properties and their values from cookieData
    console.log(cookieData);
    for (const key in cookieData) {
      console.log(`Cookie Property: ${key}, Value: ${cookieData[key]}`);
    }
    // Broadcast the received message to all connected clients with the sender's ID
    // this.server.emit('chatMessage', { message, senderId });
    messageData.senderName = cookieData['authCookie1'];
    this.server.emit('chatMessage', messageData as any);
  }
}
