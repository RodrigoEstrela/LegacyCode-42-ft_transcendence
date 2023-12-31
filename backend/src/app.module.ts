import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule, AuthController, AuthService } from './authentication';
import { User, UserModule, UserController, UserService } from './user';
import { config } from 'dotenv';
import { ChatGateway, Groupchat, GroupchatModule, GroupchatController, GroupchatService,
		Message, MessageModule, MessageController, MessageService}  from './chat';
import { GameController } from "./game/game.controller";

config();

@Module({
  imports: [
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.POSTGRES_CONTAINER,
		port: parseInt(process.env.POSTGRES_PORT_DOCKER),
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
		synchronize: true,
		autoLoadEntities: true,
	}),
	TypeOrmModule.forFeature([User]),
	AuthModule,
	TypeOrmModule.forFeature([User]),
	UserModule,
  	TypeOrmModule.forFeature([Groupchat]),
	GroupchatModule,
  	TypeOrmModule.forFeature([Message]),
	MessageModule,
],
  controllers: [AuthController, UserController, GroupchatController, MessageController, GameController],
  providers: [AuthService, UserService, ChatGateway, GroupchatService, MessageService],
})

export class AppModule {}

