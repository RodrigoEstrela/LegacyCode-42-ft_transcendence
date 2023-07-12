import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Dependencies } from '@nestjs/common';

@Controller()
@Dependencies(AppService)
export class AppController {
  private readonly appService: AppService;

  constructor(appService: AppService) {
    this.appService = appService;
  }

  @Get()
  @Render('pong')
  root() {
    // Use this.appService in your controller method logic if needed
  }
}
