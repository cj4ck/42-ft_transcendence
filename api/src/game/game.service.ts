import { Injectable } from '@nestjs/common';
import { UserI } from 'src/user/model/user.interface';
import { GameI } from 'src/game/model/game.interface';
import { PlayerI } from './model/player.interface';
import { Server } from 'socket.io';

@Injectable()
export class GameService {

	queue: PlayerI[] = [];
	games: GameI[] = [];

	lookForGamePair(server: Server){

		var queue_size = this.queue.length;

		if (queue_size > 1)
		{
			this.queue.sort((p1, p2) => p1.user.score - p2.user.score);
			var newGame: GameI = {

				player1: this.queue.pop()!,
				player2: this.queue.pop()!,
			}

			server.to(newGame.player1.socketId).to(newGame.player2.socketId).emit('PlayerGetMatch', newGame);
		}
	}

}
