import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Req, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import  AuthDto  from './auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { FortyTwoAuthGuard } from '../testGuard.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() createAuthDto: AuthDto) {
    const { username, email, password} = createAuthDto;

    // Check if a user with the same name or email already exists
    const userExists = await this.authService.checkUserExists(username, email);
    if (userExists) {
      throw new HttpException(
        'User with the same name or email already exists',
        HttpStatus.CONFLICT,
      );
    }
    // If no user with the same name or email exists, create the user
    console.log('Received create user request');
    const userCreated = await this.authService.createUser(username, email, password);
    console.log(userCreated);
    return userCreated;
  }

  // @UseGuards(AuthGuard('42'))
  // @Get()
  // getHello(@Req() request: Request): string {
  //   return this.authService.getHello(request);
  // }

  @UseGuards(FortyTwoAuthGuard)
  @Get('42/callback')
  callBack(@Req() request: Request): string {
    console.log("d3efewfwe")
    return this.authService.getHello(request);
  }
}

export default AuthController;
