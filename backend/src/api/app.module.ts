import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
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
	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'html_files'),
		exclude: ['/api*'],
	}),
	AuthenticationModule,
	TypeOrmModule.forFeature([Auth])
],
  controllers: [AppController, AuthenticationController],
  providers: [AuthService],
})
export class AppModule {}
