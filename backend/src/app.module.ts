import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';


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
		logging: true,
		entities: [__dirname + '/**/*.entity(.ts,.js)'],
	}),
	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'game'),
		exclude: ['/api*'],
	}),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
