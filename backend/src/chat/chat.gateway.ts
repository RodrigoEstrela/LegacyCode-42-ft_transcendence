import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpException } from "@nestjs/common";
import * as cookie from 'cookie';
import { UserService } from "../user/user.service";
import { User } from "../entities";
import { MessageService, Message } from ".";
import messageEntity from "../entities/message.entity";
import { GroupchatService } from './groupchat/groupchat.service';

interface MessageData {
  senderId: string;
  message: string;
  cookieData: Record<string, string>;
  senderName: string;
  receiverName: string;
  messageType: string,
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly userService: UserService,
              private messageService: MessageService,
              private groupchatService: GroupchatService) {}
  private connectedClients = new Map<string, any>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const headers = client.handshake.headers;
    const cookieHeader = headers['cookieheader'];
    console.log('cookieHeader:', cookieHeader);
    if (typeof cookieHeader === 'string') {
      const cookieData = JSON.parse(cookieHeader);
      const authCookie = cookieData.authCookie1;
      console.log("set socket id for: " + authCookie);
      this.userService.setSocketId(authCookie, client.id);
    }

    this.connectedClients.set(client.id, client);
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

    console.log("messageType: " + messageData.messageType);

    if (messageData.messageType == "dm")
    {
      console.log(`Received message from client ${messageData.senderName}: ${messageData.message} to ${messageData.receiverName}`);
      const receiversocketid = await this.userService.getSocketId(messageData.receiverName);
      console.log("receiversocketid: " + receiversocketid);
      const receiver_socket = this.findWebSocketById(receiversocketid);
      if (receiver_socket)
        receiver_socket.emit('chatMessage', messageData as any);
      client.emit('chatMessage', messageData as any);
      await this.messageService.create(messageData.senderName, messageData.receiverName, messageData.message, new Date().toISOString());
    }
    else if (messageData.messageType == "gc")
    {
      console.log(`Received message from client ${messageData.senderName}: ${messageData.message} to ${messageData.receiverName}`);
      const userlist = await this.groupchatService.getGroupchatMembers(messageData.receiverName);
      if (!userlist.includes(messageData.senderName))
        throw new HttpException('You are not on this groupchat', 401);
      await this.messageService.create(messageData.senderName, messageData.receiverName, messageData.message, new Date().toISOString())
      client.emit('chatMessage', messageData as any);

      messageData.message = messageData.senderName + ": " + messageData.message;
      for (const x in userlist)
      {
        if (userlist[x] == messageData.senderName)
          continue;
        const receiversocketid = await this.userService.getSocketId(userlist[x]);
        const receiver_socket = this.findWebSocketById(receiversocketid);
        if (receiver_socket)
        {
          messageData.senderName = messageData.receiverName;
          receiver_socket.emit('chatMessage', messageData as any);
        }
        await this.messageService.create(messageData.receiverName, userlist[x], messageData.message, new Date().toISOString());
      }
    }
  }
}

export default ChatGateway;
