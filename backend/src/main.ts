import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as session from 'express-session';

config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
      session({
          secret: "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",
          resave: false,
          saveUninitialized: false,
      }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    allowedHeaders : ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization',/* 'Credentials'*/],
    exposedHeaders : [],
  });

  await app.listen(parseInt(process.env.BACKEND_PORT_DOCKER));
  console.log(`NestJS server is running on http://localhost:${process.env.BACKEND_PORT_DOCKER}`);
}

bootstrap();
