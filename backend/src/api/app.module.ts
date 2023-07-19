import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth, AuthModule, AuthController, AuthService } from './authentication';

@Module({
  imports: [
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: 'ft_transcendence_postgres',
		port: 5432,
		username: 'rdas-nev',
		password: 'inception123',
		database: 'pongdb',
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
