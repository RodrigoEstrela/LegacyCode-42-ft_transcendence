import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { CustomSocketIoAdapter } from './custom-socket-io-adapter';

config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    allowedHeaders : ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders : ['Set-Cookie'],
  });

  await app.listen(parseInt(process.env.BACKEND_PORT_DOCKER));
  console.log(`NestJS server is running on http://localhost:${process.env.BACKEND_PORT_DOCKER}`);
}

bootstrap();
