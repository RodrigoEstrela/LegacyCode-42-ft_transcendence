import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth, AuthModule, AuthController, AuthService } from './authentication';
import { config } from 'dotenv';

config();

@Module({
  imports: [
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.POSTGRES_HOST,
		port: parseInt(process.env.POSTGRES_HOST_PORT),
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
		synchronize: true,
		autoLoadEntities: true,
	}),
	TypeOrmModule.forFeature([Auth]),
	AuthModule
],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
