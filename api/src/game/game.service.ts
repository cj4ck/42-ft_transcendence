import { Injectable } from '@nestjs/common';
import { UserI } from 'src/user/model/user.interface';
import { GameI } from 'src/game/model/game.interface';

@Injectable()
export class GameService {

	queue: UserI[] = [];
	games: GameI[] = [];

	lookForGamePair(){
		if (this.queue.length > 2)
		{
			this.queue = this.queue.sort((p1, p2) => p1.score - p2.score);
			var newGame: GameI;
			newGame.player1 = this.queue.pop();
			newGame.player2 = this.queue.pop();
		}
	}

}
