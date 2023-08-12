import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth, AuthModule, AuthController, AuthService } from './authentication';
import { User, UserModule, UserController, UserService } from './user';
import { config } from 'dotenv';
import { ChatGateway }  from './chat/app.gateway';
import InitialDatabaseSeed from './seeding/seeds/initalSeed';

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
	TypeOrmModule.forFeature([Auth]),
	AuthModule,
	TypeOrmModule.forFeature([User]),
	UserModule,
],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService, ChatGateway],
})

export class AppModule {}
