import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/pong')
  @Render('pong')
  pong() {
    // Use this.appService in your controller method logic if needed
  }
  @Get('/form')
  @Render('form')
  form() {
    // Use this.appService in your controller method logic if needed
  }
}
