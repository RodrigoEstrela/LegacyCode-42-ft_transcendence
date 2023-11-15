import {Controller, Get, Post, Body, Param, HttpStatus, Res} from "@nestjs/common";
import  GameDto  from "./game.dto";
import {Response} from "express";

@Controller('game')
export class GameController {

	constructor() {}

	private gameQueue: string[] = [];
	@Post('queue')
	async queue(@Body() queueDto: GameDto, @Res() response: Response) {
		const  username  = queueDto.authCookie1;
		console.log('Received queue request');
		console.log(username);
		this.gameQueue.push(username);
		if (this.gameQueue.length >= 2) {
			const player1 = this.gameQueue.shift();
			const player2 = this.gameQueue.shift();
			response.status(201).send("http://localhost:3000/game/" + player1 + "/" + player2);
			return { player1, player2 };
		}
		response.status(201).send("http://localhost:3000/queue");
	}
}
