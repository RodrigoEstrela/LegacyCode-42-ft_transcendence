import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './modules';
import { Auth } from './entities/auth.entity';
import { AuthenticationController } from './controllers';
import { AuthService } from './services/auth.service';

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
	AuthenticationModule
],
  controllers: [AuthenticationController],
  providers: [AuthService],
})
export class AppModule {}
