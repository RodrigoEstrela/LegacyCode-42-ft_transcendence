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
	@UseGuards(FortyTwoAuthGuard)
	@Get('42/callback')
	callBack(@Req() request: Request, @Res() response: Response): void {
		const sessionID =  request['username'];
		console.log("sessionID after login: " + sessionID);
		response.cookie('authCookie1', sessionID, { maxAge: 3600000, path: '/' });
		response.redirect(301, "http://localhost:3000");
        response.status(HttpStatus.CREATED).send();
    }

}

export default AuthController;
