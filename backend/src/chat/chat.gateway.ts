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
import GameDto from "../game/game.dto";
import {combineLatestInit} from "rxjs/internal/observable/combineLatest";

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
  hit: number;
}

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService,
              private messageService: MessageService,
              private groupchatService: GroupchatService) {
  }

  private connectedChatClients = new Map<string, any>();
  private connectedGameClients = new Map<string, any>();
  private currentGames = new Map<string, any>;

  handleConnection(client: Socket, @Res() response: Response) {
    console.log(`Client connected: ${client.id}`);

    const headers = client.handshake.headers;
    const cookieHeader = headers['cookieheader'];
    console.log('cookieHeader:', cookieHeader);
    console.log('connectiontype: ', headers['connectiontype']);
    if (headers['connectiontype'] == "1") {
      if (typeof cookieHeader === 'string') {
        const cookieData = JSON.parse(cookieHeader);
        const authCookie = cookieData.authCookie1;
        console.log("set socket id for: " + authCookie);
        this.userService.setChatSocket(authCookie, client.id);
      }
      this.connectedChatClients.set(client.id, client);
    } else {
      let authCookie: string;
      if (typeof cookieHeader === 'string') {
        const cookieData = JSON.parse(cookieHeader);
        authCookie = cookieData.authCookie1;
        console.log("set socket id for: " + authCookie);
        this.userService.setGameSocket(authCookie, client.id);
      }

      const gameId = headers['gameid'];
      if (typeof gameId === 'string') {
        console.log("GameId: " + gameId);
        const gamePlayers = gameId.split(':');
        const player0 = gamePlayers[0];
        const player1 = gamePlayers[1];
        this.connectedGameClients.set(authCookie, client);
        if (authCookie == player0) {
          const gameSockets = this.currentGames.get(gameId);
          if (gameSockets) {
            const otherValue = gameSockets.split(':');
            this.currentGames.set(gameId, client.id + ":" + otherValue[1] + ":" + "00");
          } else
            this.currentGames.set(gameId, client.id + ":" + "x");
        } else {
          const gameSockets = this.currentGames.get(gameId);
          if (gameSockets) {
            const otherValue = gameSockets.split(':');
            this.currentGames.set(gameId, otherValue[0] + ":" + client.id + ":" + "00");
          } else
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

    if (messageData.messageType == "dm") {
      console.log(`Received message from client ${messageData.senderName}: ${messageData.message} to ${messageData.receiverName}`);
      const receiversocketid = await this.userService.getChatSocket(messageData.receiverName);
      console.log("receiversocketid: " + receiversocketid);
      const receiver_socket = this.findWebSocketById(receiversocketid);
      if (receiver_socket)
        receiver_socket.emit('chatMessage', messageData as any);
      client.emit('chatMessage', messageData as any);
      await this.messageService.create(messageData.senderName, messageData.receiverName, messageData.message, new Date().toISOString());
    } else if (messageData.messageType == "gc") {
      let password: string = "";
      const headers = client.handshake.headers;
      const cookieHeader = headers['cookieheader'];
      if (typeof cookieHeader === 'string') {
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
      for (const x in userlist) {
        if (userlist[x] == messageData.senderName)
          continue;
        const receiversocketid = await this.userService.getChatSocket(userlist[x]);
        const receiver_socket = this.findWebSocketById(receiversocketid);
        if (receiver_socket) {
          messageData.senderName = messageData.receiverName;
          receiver_socket.emit('chatMessage', messageData as any);
        }
        await this.messageService.create(messageData.receiverName, userlist[x], messageData.message, new Date().toISOString());
      }
    }
  }


  private playersReady = 0;
  private ballSize = 5;
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
  private paddleHeight = 110; // Adjust the paddle hitbox height
  private paddleWidth = 15; // Adjust the paddle hitbox width
  private player0Score: number = 0;
  private player1Score: number = 0;
  private ballHitCounter: number = 1;
  private hit = 0;
  private p0Moving = 0;
  private p1Moving = 0;

  @SubscribeMessage('startgame')
  startGameLoop(client: Socket, gameId: string) {
    console.log("GameStarted");
    console.log("Game Id: " + gameId);

    // Assuming you want to start the game after 5 seconds, adjust the duration as needed
    const delayInSeconds = 0;

    setTimeout(() => {
      const game = this.currentGames.get(gameId.split('/')[1]);
      console.log(game);

      if (game.split(':')[2] == "11") {
        if (!this.gameInterval) {
          this.gameInterval = setInterval(() => {
            this.updateGame(client, gameId);
          }, 1000 / 60); // 60 frames per second
        }
      }
    }, delayInSeconds * 1000); // Convert seconds to milliseconds
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
      this.playersReady = 0;
    }
  }

  @SubscribeMessage('ready')
  readyUp(client: Socket, gameInfo: string) {
    const gameId = gameInfo.split(':')[0] + ':' + gameInfo.split(':')[1];
    const playerReady = gameInfo.split(':')[2];
    const sockets = this.currentGames.get(gameId);
    if (sockets.split(":")[2] == "00"){
      const array = sockets.split('');
      if (playerReady == gameId.split(':')[0])
      {
        array[array.length - 2] = '1';
        this.currentGames.set(gameId, array.join(''));
        console.log(this.currentGames.get(gameId));
      }
      else if (playerReady == gameId.split(':')[1])
      {
        array[array.length - 1] = '1';
        this.currentGames.set(gameId, array.join(''));
        console.log(this.currentGames.get(gameId));
      }
    }
    else if (sockets.split(":")[2] == "01" || sockets.split(":")[2] == "10"){
      const array = sockets.split('');
      if (playerReady == gameId.split(':')[0])
      {
        array[array.length - 2] = '1';
        this.currentGames.set(gameId, array.join(''));
        console.log(this.currentGames.get(gameId));
      }
      else if (playerReady == gameId.split(':')[1])
      {
        array[array.length - 1] = '1';
        this.currentGames.set(gameId, array.join(''));
        console.log(this.currentGames.get(gameId));
      }
    }
  }

  @SubscribeMessage('player0Down')
  movePlayer0Down(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player0 = gameplayers[0];
    const move = gameinfoparts[2];
    if (move == '1')
      this.p0Moving = 1;
    else if (move == '2')
      this.p0Moving = 0;
  }

  @SubscribeMessage('player0Up')
  movePlayer0Up(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player0 = gameplayers[0];
    const move = gameinfoparts[2];
    if (move == '1')
      this.p0Moving = -1;
    else if (move == '2')
      this.p0Moving = 0;
  }

  @SubscribeMessage('player1Down')
  movePlayer1Down(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player1 = gameplayers[1];
    const move = gameinfoparts[2];
    if (move == '1')
      this.p1Moving = 1;
    else if (move == '2')
      this.p1Moving = 0;
  }

  @SubscribeMessage('player1Up')
  movePlayer1Up(client: Socket, gameinfo: string) {
    const gameinfoparts = gameinfo.split('|');
    const user = gameinfoparts[0];
    const gameid = gameinfoparts[1];
    const gameplayers = gameid.split(':');
    const player1 = gameplayers[1];
    const move = gameinfoparts[2];
    if (move == '1')
      this.p1Moving = -1;
    else if (move == '2')
      this.p1Moving = 0;
  }


  updateGame(client, gameId) {
    this.hit = 0;
    const type = gameId.split('/')[0];
    const playerstring: string = gameId.split('/')[1];
    const players = playerstring.split(':');
    const player0 = this.findWebSocketById2(players[0]);
    const player1 = this.findWebSocketById2(players[1]);
    if (this.p0Moving == 1)
      this.player0 += 10;
    else if (this.p0Moving == -1)
      this.player0 -= 10;
    if (this.p1Moving == 1)
      this.player1 += 10;
    else if (this.p1Moving == -1)
      this.player1 -= 10;
    if (this.player0 < 0)
      this.player0 = 0;
    else if (this.player0 + this.paddleHeight > this.canvasHeight)
      this.player0 = this.canvasHeight - this.paddleHeight;
    if (this.player1 < 0)
      this.player1 = 0;
    else if (this.player1 + this.paddleHeight > this.canvasHeight)
      this.player1 = this.canvasHeight - this.paddleHeight;
    // Update the game state, including ball position, collision detection, scoring, etc.
    this.updateBallPosition(players[0], players[1], type);

    const score = this.player0Score + ":" + this.player1Score;

    const gameData: GameData = {
      ballX: this.ballX,
      ballY: this.ballY,
      ballSpeedX: this.ballSpeedX,
      ballSpeedY: this.ballSpeedY,
      score: score,
      player0: this.player0,
      player1: this.player1,
      hit: this.hit,
    };

    // Send the updated game state to all players
    if (player0)
      player0.emit('gameupdate', gameData);
    if (player1)
      player1.emit('gameupdate', gameData);
  }

  async updateBallPosition(player0: string, player1: string, type: string) {
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;
    let paddleHit = (this.ballY - this.player0) / this.paddleHeight;
    if (paddleHit < 0)
      paddleHit = 0;
    else if (paddleHit > 1)
      paddleHit = 1;
    // console.log("Ball Hit Counter" + this.ballHitCounter);
    // console.log("Ball Speed X" + this.ballSpeedX);

    // console.log("X Ball Speed: " + this.ballSpeedX);
    // console.log("Y Ball Speed: " + this.ballSpeedY);
    // Ensure the ball stays within the canvas boundaries
    if (this.ballX < 0) {
      // this.ballX = 0;
      // this.ballSpeedX = Math.abs(this.ballSpeedX); // Reverse X speed
      this.player1Score++;
      console.log("Player1 Scoooored!!!!!!");
      this.ballHitCounter = 1;
      this.ballSpeedX = -5;
      this.ballSpeedY = Math.random() * 4 - 2;
      this.ballX = 750;
      this.ballY = Math.random() * 350 + 20;
      if (this.player1Score == 5) {
        const score: string = this.player0Score + ":" + this.player1Score;
        this.stopGameLoop();
        await this.userService.manageStatsAndUsers(player1, "game", "win-" + type)
        await this.userService.manageStatsAndUsers(player0, "game", "loss-" + type)
        await this.userService.addGameHistory(player1, player0, score, "win", type)
        await this.userService.addGameHistory(player0, player1, score, "loss", type)
      }
    } else if (this.ballX + this.ballSize > this.canvasWidth) {
      // this.ballX = this.canvasWidth - 10;
      // this.ballSpeedX = -Math.abs(this.ballSpeedX); // Reverse X speed
      this.player0Score++;
      console.log("Player0 Scoooored!!!!!!");
      this.ballHitCounter = 1;
      this.ballSpeedX = 5;
      this.ballSpeedY = Math.random() * 4 - 2;
      this.ballX = 50;
      this.ballY = Math.random() * 350 + 20;
      if (this.player0Score == 5) {
        const score: string = this.player0Score + ":" + this.player1Score;
        this.stopGameLoop();
        await this.userService.manageStatsAndUsers(player0, "game", "win-" + type)
        await this.userService.manageStatsAndUsers(player1, "game", "loss-" + type)
        await this.userService.addGameHistory(player0, player1, score, "win", type)
        await this.userService.addGameHistory(player1, player0, score, "loss", type)
      }
    }

    else if (this.ballY - this.ballSize < 0) {
      this.ballY = this.ballSize;
      this.ballSpeedY = Math.abs(this.ballSpeedY); // Reverse Y speed
      this.ballHitCounter++;
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 2.5;
    }
    else if (this.ballY + this.ballSize > this.canvasHeight) {
      this.ballY = this.canvasHeight - 10;
      this.ballSpeedY = -Math.abs(this.ballSpeedY); // Reverse Y speed
      this.ballHitCounter++;
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 2.5;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 2.5;
    }

    // Check for collision with Player 0 paddle
    else if (
        this.ballX - this.ballSize < this.paddleWidth &&
        this.ballY > this.player0 &&
        this.ballY < this.player0 + this.paddleHeight
    ) {
      // Handle collision with Player 0 paddle
      // console.log("ballY: " + this.ballY + "player0: " + this.player0);
      // console.log("paddleHit: " + paddleHit);
      let deviate = (2 * ((paddleHit - 0.5) ** 2)) + 1;
      if (paddleHit < 0.5)
        deviate = -deviate;
      console.log("Paddel Hit: " + paddleHit);
      console.log("deviate: " + deviate);
      this.ballX = this.paddleWidth + this.ballSize;
      this.ballSpeedX = Math.abs(this.ballSpeedX); // Reverse X speed
      // console.log("player0 hit the ball!!!!");
      this.ballHitCounter++;
      console.log("X Ball Speed 1: " + this.ballSpeedX);
      console.log("Y Ball Speed 1: " + this.ballSpeedY);
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 4;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 4;
      let angle = Math.PI / 14 * deviate;
      console.log("Angle: " + angle);
      let magnitude = Math.sqrt(this.ballSpeedX ** 2 + this.ballSpeedY ** 2);
      let normalizedSpeedX = this.ballSpeedX / magnitude;
      let normalizedSpeedY = this.ballSpeedY / magnitude;
      // Calculate the new ball speed components using rotation
      this.ballSpeedX = normalizedSpeedX * Math.cos(angle) - normalizedSpeedY * Math.sin(angle);
      this.ballSpeedY = normalizedSpeedX * Math.sin(angle) + normalizedSpeedY * Math.cos(angle);
      this.ballSpeedX *= magnitude;
      this.ballSpeedY *= magnitude;
      console.log("X Ball Speed 3: " + this.ballSpeedX);
      console.log("Y Ball Speed 3: " + this.ballSpeedY);
      this.hit = 1;
    }

    // Check for collision with Player 1 paddle
    else if (
        this.ballX + this.ballSize > this.canvasWidth - this.paddleWidth &&
        this.ballY > this.player1 &&
        this.ballY < this.player1 + this.paddleHeight
    ) {
      // Handle collision with Player 1 paddle
      // console.log("ballY: " + this.ballY + "player0: " + this.player0);
      // console.log("paddleHit: " + paddleHit);
      let deviate = (2 * ((paddleHit - 0.5) ** 2)) + 1;
      if (paddleHit > 0.5)
        deviate = -deviate;
      console.log("Paddel Hit: " + paddleHit);
      console.log("deviate: " + deviate);
      this.ballX = this.canvasWidth - this.paddleWidth - this.ballSize;
      this.ballSpeedX = -Math.abs(this.ballSpeedX); // Reverse X speed
      // console.log("player1 hit the ball!!!!");
      this.ballHitCounter++;
      console.log("X Ball Speed 1: " + this.ballSpeedX);
      console.log("Y Ball Speed 1: " + this.ballSpeedY);
      this.ballSpeedX *= 1 + (1 / this.ballHitCounter) / 4;
      this.ballSpeedY *= 1 + (1 / this.ballHitCounter) / 4;
      let angle = Math.PI / 14 * deviate;
      console.log("Angle: " + angle);
      let magnitude = Math.sqrt(this.ballSpeedX ** 2 + this.ballSpeedY ** 2);
      let normalizedSpeedX = this.ballSpeedX / magnitude;
      let normalizedSpeedY = this.ballSpeedY / magnitude;
      // Calculate the new ball speed components using rotation
      this.ballSpeedX = normalizedSpeedX * Math.cos(angle) - normalizedSpeedY * Math.sin(angle);
      this.ballSpeedY = normalizedSpeedX * Math.sin(angle) + normalizedSpeedY * Math.cos(angle);
      this.ballSpeedX *= magnitude;
      this.ballSpeedY *= magnitude;
      console.log("X Ball Speed 3: " + this.ballSpeedX);
      console.log("Y Ball Speed 3: " + this.ballSpeedY);
      this.hit = 1;
    }
  }

  private ladderQueue = new Map<string, any>;
  private friendlyQueue = new Map<string, any>;
  @SubscribeMessage('ladderqueue')
  async queueCompetetive(client: Socket, user: string) {
    console.log('Received queue request');
    console.log(user);
    user = user.substring(16, user.indexOf('"', 16));
    this.ladderQueue.set(user, client);
    if (Array.from(this.ladderQueue.keys()).length >= 2) {
      // print the list of keys on the gameQueue map
      const user = Array.from(this.ladderQueue.keys())[0];
      const user2 = Array.from(this.ladderQueue.keys())[1];
      const gameId =  "ladder/" + user + ":" + user2;
      const player1 = this.ladderQueue.get(user);
      this.ladderQueue.delete(user);
      const player2 = this.ladderQueue.values().next().value;
      this.ladderQueue.delete(user2);
      this.friendlyQueue.delete(user);
      this.friendlyQueue.delete(user2);
      player1.emit('gameFound', gameId);
      player2.emit('gameFound', gameId);
    }
  }

  @SubscribeMessage('friendlyqueue')
  async queueFriendly(client: Socket, user: string) {
    console.log('Received queue request');
    console.log(user);
    user = user.substring(16, user.indexOf('"', 16));
    console.log(user);
    this.friendlyQueue.set(user, client);
    if (Array.from(this.friendlyQueue.keys()).length >= 2) {
      // print the list of keys on the gameQueue map
      console.log(Array.from(this.friendlyQueue.keys())[0]);
      console.log('Found 2 players');
      const user = Array.from(this.friendlyQueue.keys())[0];
      const user2 = Array.from(this.friendlyQueue.keys())[1];
      console.log('user1: ' + user);
      console.log('user2: ' + user2);
      const gameId = "friendly/" + user + ":" + user2;
      const player1 = this.friendlyQueue.get(user);
      this.friendlyQueue.delete(user);
      const player2 = this.friendlyQueue.values().next().value;
      this.friendlyQueue.delete(user2);
      this.ladderQueue.delete(user);
      this.ladderQueue.delete(user2);
      player1.emit('gameFound', gameId);
      player2.emit('gameFound', gameId);
    }
  }

  private gameInvites : string[] = [];

  @SubscribeMessage('challenge')
  async challenge(client: Socket, challengeInfo: string)
  {
    console.log(client.id + "sent a challenge");
    this.gameInvites.push(challengeInfo);
  }

  @SubscribeMessage('acceptchallenge')
  async acceptchallenge(client: Socket, challengeInfo: string)
  {
    console.log(client.id + "accepted a challenge");
    // check if a string is a string array
    console.log(this.gameInvites);
    console.log("\n\nchallengeInfo: " + challengeInfo);
    if (this.gameInvites.includes(challengeInfo))
    {
      this.gameInvites.splice(this.gameInvites.indexOf(challengeInfo), 1);
      const player1 = this.findWebSocketById(await this.userService.getChatSocket(challengeInfo.split(':')[0]));
      const player2 = this.findWebSocketById(await this.userService.getChatSocket(challengeInfo.split(':')[1]));
      const gameId = "friendly/" + challengeInfo.split(':')[0] + ":" + challengeInfo.split(':')[1];
      player1.emit('gameFound', gameId);
      player2.emit('gameFound', gameId);
    }
  }
}

export default ChatGateway;
