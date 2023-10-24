import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import  AuthDto  from './auth.dto';
import { FortyTwoAuthGuard } from '../testGuard.guard';
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";

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
	@UseGuards(FortyTwoAuthGuard)
	@Get('42/callback')
	callBack(@Req() request: Request, @Res() response: Response): void {
		const sessionID =  request['username'];
		console.log("sessionID after login: " + sessionID);

		response.cookie('authCookie1', sessionID, { maxAge: 3600000, path: '/' });
		response.redirect(301, "http://localhost:3000");
    }
}

export default AuthController;
