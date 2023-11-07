import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {HttpException, Res} from "@nestjs/common";
import * as cookie from 'cookie';
import { UserService } from "../user/user.service";
import { User } from "../entities";
import { MessageService, Message } from ".";
import messageEntity from "../entities/message.entity";
import { GroupchatService } from './groupchat/groupchat.service';
import {getAbsoluteMappingEntries} from "tsconfig-paths/lib/mapping-entry";
import {Response} from "express";

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
  score: string;
  player0: number;
  player1: number;
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
  private currentGames = new Map<string, any>;

  handleConnection(client: Socket, @Res() response: Response) {
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
      let authCookie: string;
      if (typeof cookieHeader === 'string') {
        const cookieData = JSON.parse(cookieHeader);
        authCookie = cookieData.authCookie1;
        console.log("set socket id for: " + authCookie);
        this.userService.setGameSocket(authCookie, client.id);
      }

      const gameId = headers['gameid'];
      if (typeof gameId === 'string')
      {
        console.log("GameId: " + gameId);
        const gamePlayers = gameId.split(':');
        const player0 = gamePlayers[0];
        const player1 = gamePlayers[1];
        this.connectedGameClients.set(authCookie, client);
        if (authCookie == player0) {
          const gameSockets = this.currentGames.get(gameId);
          if (gameSockets)
          {
            const otherValue = gameSockets.split(':');
            this.currentGames.set(gameId, client.id + ":" + otherValue[1]);
          }
          else
            this.currentGames.set(gameId, client.id + ":" + "x");
        }
        else {
          const gameSockets = this.currentGames.get(gameId);
          if (gameSockets)
          {
            const otherValue = gameSockets.split(':');
            this.currentGames.set(gameId, otherValue[0] + ":" + client.id);
          }
          else
            this.currentGames.set(gameId, "x" + ":" + client.id);
        }
      }
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

  findWebSocketById2(id: string) {
    return this.connectedGameClients.get(id);
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
      let password : string = "";
      const headers = client.handshake.headers;
      const cookieHeader = headers['cookieheader'];
      if (typeof cookieHeader === 'string')
      {
        const cookieData = JSON.parse(cookieHeader);
        password = cookieData.password;
      }
      console.log(`Received message from client ${messageData.senderName}: ${messageData.message} to ${messageData.receiverName}`);
      const userlist = await this.groupchatService.getGroupchatMembers(messageData.receiverName);
      if (!await this.groupchatService.authorizeMessage(messageData.receiverName, messageData.senderName, password))
        throw new HttpException('Unauthorized groupchat access', 401);
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
  private ballMaxSpeed: number = 40;
  private gameInterval: NodeJS.Timeout | null = null;
  private canvasWidth = 800;
  private canvasHeight = 400;
  private player0 = 200;
  private player1 = 200;
  private paddleHeight = 150; // Adjust the paddle hitbox height
  private paddleWidth = 15; // Adjust the paddle hitbox width
  private player0Score: number = 0;
  private player1Score: number = 0;
  private ballHitCounter: number = 1;

  @SubscribeMessage('startgame')
  startGameLoop(client: Socket, gameId: string) {
    console.log("GameStarted");
    console.log("Game Id: " + gameId);
    if (!this.gameInterval) {
      this.gameInterval = setInterval(() => {
        this.updateGame(client, gameId);
      }, 1000 / 60); // 60 frames per second
    }
  }

  @SubscribeMessage('stopgame')
  stopGameLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval as unknown as number);
      this.gameInterval = null;
      this.ballX = 50;
      this.ballY = 50;
      this.ballSpeedX = 5;
      this.ballSpeedY = 2;
      this.player0Score = 0;
      this.player1Score = 0;
      this.ballHitCounter = 1;
    }
  }

  @SubscribeMessage('player0Down')
  movePlayer0Down(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player0 = gameplayers[0];
    if (user == player0)
    {
      this.player0 += 10;
      if (this.player0 + this.paddleHeight > this.canvasHeight)
        this.player0 = this.canvasHeight - this.paddleHeight;
    }
  }
  @SubscribeMessage('player0Up')
  movePlayer0Up(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player0 = gameplayers[0];
    if (user == player0)
    {
      this.player0 -= 10;
      if (this.player0 < 0)
        this.player0 = 0;
    }
  }
  @SubscribeMessage('player1Down')
  movePlayer1Down(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player1 = gameplayers[1];
    if (user == player1)
    {
      this.player1 += 10;
      if (this.player1 + this.paddleHeight > this.canvasHeight)
        this.player1 = this.canvasHeight - this.paddleHeight;
    }
  }
  @SubscribeMessage('player1Up')
  movePlayer1Up(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player1 = gameplayers[1];
    if (user == player1)
    {
      this.player1 -= 10;
      if (this.player1 < 0)
        this.player1 = 0;
    }
  }


  updateGame(client, gameId) {
    // Update the game state, including ball position, collision detection, scoring, etc.
    this.updateBallPosition();

    const score = this.player0Score + ":" + this.player1Score;

    const gameData: GameData = {
      ballX: this.ballX,
      ballY: this.ballY,
      ballSpeedX: this.ballSpeedX,
      ballSpeedY: this.ballSpeedY,
      score: score,
      player0: this.player0,
      player1: this.player1,
    };

    // Send the updated game state to all players
    const players = gameId.split(':');
    const player0 = this.findWebSocketById2(players[0]);
    const player1 = this.findWebSocketById2(players[1]);
    if (player0)
      player0.emit('gameupdate', gameData);
    if (player1)
      player1.emit('gameupdate', gameData);
  }

  updateBallPosition() {
    const paddleHit = (this.ballY - this.player0) / this.paddleHeight;
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;
    // console.log("Ball Hit Counter" + this.ballHitCounter);
    // console.log("Ball Speed X" + this.ballSpeedX);

    // Ensure the ball stays within the canvas boundaries
    if (this.ballX < 0) {
      // this.ballX = 0;
      // this.ballSpeedX = Math.abs(this.ballSpeedX); // Reverse X speed
      this.player1Score++;
      console.log("Player1 Scoooored!!!!!!");
      this.ballHitCounter = 1;
      this.ballSpeedX = -5;
      this.ballSpeedY = 2;
      this.ballX = 750;
      this.ballY = 50;
    } else if (this.ballX > this.canvasWidth - 10) {
      // this.ballX = this.canvasWidth - 10;
      // this.ballSpeedX = -Math.abs(this.ballSpeedX); // Reverse X speed
      this.player0Score++;
      console.log("Player0 Scoooored!!!!!!");
      this.ballHitCounter = 1;
      this.ballSpeedX = 5;
      this.ballSpeedY = 2;
      this.ballX = 50;
      this.ballY = 50;
    }

    if (this.ballY < 0) {
      this.ballY = 0;
      this.ballSpeedY = Math.abs(this.ballSpeedY); // Reverse Y speed
      this.ballHitCounter++;
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 2.5;
    } else if (this.ballY > this.canvasHeight - 10) {
      this.ballY = this.canvasHeight - 10;
      this.ballSpeedY = -Math.abs(this.ballSpeedY); // Reverse Y speed
      this.ballHitCounter++;
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 2.5;
    }

    // Check for collision with Player 0 paddle
    if (
        this.ballX < this.paddleWidth &&
        this.ballY > this.player0 &&
        this.ballY < this.player0 + this.paddleHeight
    ) {
      // Handle collision with Player 0 paddle
      console.log("ballY: " + this.ballY + "player0: " + this.player0);
      // const paddleHit = (this.ballY - this.player0) / this.paddleHeight;
      console.log("paddleHit: " + paddleHit);
      let deviate = (2 * ((paddleHit - 0.5) ** 2)) + 1;
      if (deviate > 1.5)
        deviate = 1.5;
      console.log("deviate: " + deviate);
      this.ballX = this.paddleWidth;
      this.ballSpeedX = Math.abs(this.ballSpeedX); // Reverse X speed
      console.log("player0 hit the ball!!!!");
      this.ballHitCounter++;
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= deviate;
      this.ballSpeedX /= deviate;
    }

    // Check for collision with Player 1 paddle
    if (
        this.ballX > this.canvasWidth - this.paddleWidth &&
        this.ballY > this.player1 &&
        this.ballY < this.player1 + this.paddleHeight
    ) {
      // Handle collision with Player 1 paddle
      console.log("ballY: " + this.ballY + "player0: " + this.player0);
      // const paddleHit = (this.ballY - this.player0) / this.paddleHeight;
      console.log("paddleHit: " + paddleHit);
      let deviate = (2 * ((paddleHit - 0.5) ** 2)) + 1;
      if (deviate > 1.5)
        deviate = 1.5;
      console.log("deviate: " + deviate);
      this.ballX = this.canvasWidth - this.paddleWidth;
      this.ballSpeedX = -Math.abs(this.ballSpeedX); // Reverse X speed
      console.log("player1 hit the ball!!!!");
      this.ballHitCounter++;
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= deviate;
      this.ballSpeedX /= deviate;
    }

  }
}

export default ChatGateway;
