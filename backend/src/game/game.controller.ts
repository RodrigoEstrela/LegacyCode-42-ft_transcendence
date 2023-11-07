import {Controller, Get, Post, Body, Param, HttpStatus, Res} from "@nestjs/common";
import  GameDto  from "./game.dto";
import {Response} from "express";

@Controller('game')
export class GameController {

	constructor() {}

	@Post('queue')
	async queue(@Body() queueDto: GameDto, @Res() response: Response) {
		const  username  = queueDto.authCookie1;
		console.log('Received queue request');
		console.log(username);
		response.redirect(301, "http://localhost:3000/game");
		response.status(201).send();
		return { username };
	}
}
