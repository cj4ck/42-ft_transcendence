import { Controller, Get, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {

	constructor(private gameService: GameService){}

	@Get('/game')
	async findGameByID(@Query('id') id: number) {
		return this.gameService.gameByID(id);
	}

	@Get('/wingames')
	async findWinGameForPlayer(@Query('id') id: number) {
		return this.gameService.winGameForPlayer(id);
	}

	@Get('/lostgames')
	async findLostGameForPlayer(@Query('id') id: number) {
		return this.gameService.lostGameForPlayer(id);
	}

}
