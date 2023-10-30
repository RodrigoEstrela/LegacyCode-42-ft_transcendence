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

interface GameData {
  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;
  counter: number;
}

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly userService: UserService,
              private messageService: MessageService,
              private groupchatService: GroupchatService) {}
  private connectedChatClients = new Map<string, any>();
  private connectedGameClients = new Map<string, any>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const headers = client.handshake.headers;
    const cookieHeader = headers['cookieheader'];
    console.log('cookieHeader:', cookieHeader);
    console.log('connectiontype: ', headers['connectiontype']);
    if (headers['connectiontype'] == "1")
    {
      if (typeof cookieHeader === 'string') {
        const cookieData = JSON.parse(cookieHeader);
        const authCookie = cookieData.authCookie1;
        console.log("set socket id for: " + authCookie);
        this.userService.setChatSocket(authCookie, client.id);
      }
      this.connectedChatClients.set(client.id, client);
    }
    else
    {
      if (typeof cookieHeader === 'string') {
        const cookieData = JSON.parse(cookieHeader);
        const authCookie = cookieData.authCookie1;
        console.log("set socket id for: " + authCookie);
        this.userService.setGameSocket(authCookie, client.id);
      }
      this.connectedGameClients.set(client.id, client);
    }
    client.emit('welcome', 'Welcome to the chat!');
  }

  handleDisconnect(client: Socket) {
    this.connectedChatClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  findWebSocketById(id: string) {
    return this.connectedChatClients.get(id);
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(client: Socket, messageData: MessageData) {

    console.log("messageType: " + messageData.messageType);

    if (messageData.messageType == "dm")
    {
      console.log(`Received message from client ${messageData.senderName}: ${messageData.message} to ${messageData.receiverName}`);
      const receiversocketid = await this.userService.getChatSocket(messageData.receiverName);
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
        const receiversocketid = await this.userService.getChatSocket(userlist[x]);
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



  private ballX: number = 50;
  private ballY: number = 50;
  private ballSpeedX: number = 5;
  private ballSpeedY: number = 2;
  private gameInterval: NodeJS.Timeout | null = null;
  private canvasWidth = 800;
  private canvasHeight = 400;
  minSpeedX = -10; // Adjust as needed
  maxSpeedX = 10;  // Adjust as needed
  minSpeedY = -10; // Adjust as needed
  maxSpeedY = 10;  // Adjust as needed
  counter: number = 0;

  @SubscribeMessage('startgame')
  startGameLoop(client: Socket) {
    console.log("GameStarted");
    if (!this.gameInterval) {
      this.gameInterval = setInterval(() => {
        this.updateGame(client);
      }, 1000 / 60); // 60 frames per second
    }
  }

  stopGameLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval as unknown as number);
      this.gameInterval = null;
    }
  }

  updateGame(client) {
    // Update the game state, including ball position, collision detection, scoring, etc.
    this.updateBallPosition();

    const gameData: GameData = {
        ballX: this.ballX,
        ballY: this.ballY,
        ballSpeedX: this.ballSpeedX,
        ballSpeedY: this.ballSpeedY,
        counter: 0,
    };

    // console.log("ballX: " + this.ballX);
    // console.log("ballY: " + this.ballY);
    // console.log("ballSpeedX: " + this.ballSpeedX);
    // console.log("ballSpeedY: " + this.ballSpeedY);
    // Send the updated game state to all players
    client.emit('gameupdate', gameData);
  }

  updateBallPosition() {
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    // console.log("ballX: " + this.ballX);
    // console.log("ballY: " + this.ballY);
    // console.log("canvasWidth: " + this.canvasWidth);
    // console.log("canvasHeight: " + this.canvasHeight);

    // Ensure the ball stays within the canvas boundaries
    if (this.ballX < 0) {
      this.ballX = 0;
      this.ballSpeedX = Math.abs(this.ballSpeedX); // Reverse X speed
    } else if (this.ballX > this.canvasWidth - 10) {
      this.ballX = this.canvasWidth - 10;
      this.ballSpeedX = -Math.abs(this.ballSpeedX); // Reverse X speed
    }

    if (this.ballY < 0) {
      this.ballY = 0;
      this.ballSpeedY = Math.abs(this.ballSpeedY); // Reverse Y speed
    } else if (this.ballY > this.canvasHeight - 10) {
      this.ballY = this.canvasHeight - 10;
      this.ballSpeedY = -Math.abs(this.ballSpeedY); // Reverse Y speed
    }
  }




}

export default ChatGateway;
