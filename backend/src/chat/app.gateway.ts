import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { UserService } from "../user/user.service";
import { User } from "../entities";

interface MessageData {
  senderId: string;
  message: string;
  cookieData: Record<string, string>;
  senderName: string;
  receiverName: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly userService: UserService) {}



  private connectedClients = new Map<string, any>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const headers = client.handshake.headers;

    // Access the "Cookie" header
    const cookieHeader = headers['cookieheader']; // Note the capital "C" for "Cookie"

    console.log('cookieHeader:', cookieHeader);
    if (typeof cookieHeader === 'string') {
      const cookieData = JSON.parse(cookieHeader);
      const authCookie = cookieData.authCookie1;
      if (authCookie == "rdas-nev")
        this.userService.setSocketId(authCookie, client.id);
      else
        this.userService.setSocketId("User4", client.id);
    }

    this.connectedClients.set(client.id, client);

    // Send a welcome message to the client
    client.emit('welcome', 'Welcome to the chat!');
  }

  handleDisconnect(client: Socket) {

    this.connectedClients.delete(client.id);

    console.log(`Client disconnected: ${client.id}`);
  }

  findWebSocketById(id: string) {
    return this.connectedClients.get(id);
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: Socket, messageData: MessageData) {
    const { message, senderId, cookieData, senderName} = messageData;

    messageData.senderName = cookieData['authCookie1'];
    console.log(`Received message from client ${messageData.senderName}: ${message}`);

    // Access and log the properties and their values from cookieData
    // console.log(cookieData);
    for (const key in cookieData) {
      console.log(`Cookie Property: ${key}, Value: ${cookieData[key]}`);
    }

    // console.log(messageData);

    console.log("receiverName: " + messageData.receiverName);

    //Send message to a specfic client by using their socketid
    const receiversocketid = await this.userService.getSocketId(messageData.receiverName);
    console.log("receiversocketid: " + receiversocketid);

    const receiver_socket = this.findWebSocketById(receiversocketid);
    receiver_socket.emit('chatMessage', messageData as any);
    client.emit('chatMessage', messageData as any);


    // Broadcast the received message to all connected clients with the sender's ID
    // this.server.emit('chatMessage', messageData as any);
    // client.emit('chatMessage', messageData as any);
  }
}

export default ChatGateway;
