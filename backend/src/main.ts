import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as ejs from 'ejs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'game'));
  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');
  app.setBaseViewsDir(join(__dirname, '..', 'game')); // Update the views directory path
  await app.listen(3000);
}

bootstrap();
