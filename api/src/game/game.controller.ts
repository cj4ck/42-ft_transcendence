import { Controller, Get, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {

	constructor(private gameService: GameService){}

	@Get('/game')
	async findGameByID(@Query('id') id: number) {
		console.log('FIND GAME BY ID - backend api call');
		return this.gameService.gameByID(id);
	}

}
