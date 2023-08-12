import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { runSeeder, Seeder } from 'typeorm-seeding';
import InitialDatabaseSeed from './seeding/seeds/initalSeed';

config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
  });
  await runSeeder(InitialDatabaseSeed);
  await app.listen(parseInt(process.env.BACKEND_PORT_DOCKER));
}

bootstrap();
