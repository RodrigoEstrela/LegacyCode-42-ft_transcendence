import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule, AuthController, AuthService } from './authentication';
import { User, UserModule, UserController, UserService } from './user';
import { config } from 'dotenv';
import { ChatGateway, Groupchat, GroupchatModule, GroupchatController, GroupchatService }  from './chat';
// import { UserFactory } from "src/seeding/factories/user.factory"

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
],
  controllers: [AuthController, UserController, GroupchatController],
  providers: [AuthService, UserService, ChatGateway, GroupchatService],
})

export class AppModule {}

