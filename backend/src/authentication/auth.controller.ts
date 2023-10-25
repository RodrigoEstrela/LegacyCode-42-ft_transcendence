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
	@Post('login')
	async createUser(@Body() createAuthDto: AuthDto, @Res() response: Response): Promise<any> {
        const {username, email, password} = createAuthDto;
        // Check if a user with the same name or email already exists


        const userExists = await this.authService.checkUserExists(username);
        console.log(userExists);
        console.log(username);
        if (userExists) {
            if (await this.authService.login(username, password, email) == false) {
                console.log("Wrong credentials provided");
                throw new HttpException(
                    'Wrong credentials provided',
                    HttpStatus.CONFLICT,
                );
            }
        }
        else {
            const userCreated = await this.authService.createUser(username, email, password);
            console.log(userCreated);
        }

        const sessionID = username;
        console.log("sessionID after login: " + sessionID);

        console.log("Cors Headers: ");
        console.log(response.getHeaders());
        response.cookie('authCookie1', sessionID, {maxAge: 3600000, path: '/', sameSite : 'none', secure : true});
        response.redirect(301, "http://localhost:3000/");
        // response.status(HttpStatus.CREATED).send();
    }

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
