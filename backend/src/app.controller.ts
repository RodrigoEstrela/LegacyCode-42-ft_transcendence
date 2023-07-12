import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/pong')
  @Render('pong')
  pong() {
    // Use this.appService in your controller method logic if needed
  }
  @Get('/submit')
  @Render('submit')
  submit() {
    // Use this.appService in your controller method logic if needed
  }
}

@Controller('form')
export class FormController {
  @Get()
  @Render('form')
  form() {
    // Use this.appService in your controller method logic if needed
  }
}
