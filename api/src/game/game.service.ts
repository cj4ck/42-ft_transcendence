import { Injectable } from '@nestjs/common';
import { UserI } from 'src/user/model/user.interface';
import { GameI } from 'src/game/model/game.interface';
import { GameDataI } from 'src/game/model/game-data.interface';
import { PlayerI } from './model/player.interface';
import { Server } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from './model/game.entity';
import { Repository } from 'typeorm/repository/Repository';
import { randomInt } from 'crypto';
import { UserService } from 'src/user/service/user-service/user.service';

@Injectable()
export class GameService {

	constructor(
		@InjectRepository(GameEntity)
		private readonly gameRepository: Repository<GameEntity>,
		private userService: UserService
	) {
		setInterval(() => this.gameUpdates(), 40);
	}

	queue: PlayerI[] = [];
	games: GameI[] = [];
	server: Server;

	canvas_size = 400;
	winscore = 5;

	lookForGamePair(server: Server){
		this.server = server

		var queue_size = this.queue.length;

		if (queue_size > 1)
		{
			this.queue.sort((p1, p2) => p1.user.score - p2.user.score);
			var newGame: GameI = {

				player1: this.queue.pop()!,
				player2: this.queue.pop()!,
				p1Score: 0,
				p2Score: 0,
				ballX: 400,
				ballY: 400,
				ballMoveX: 4,
				ballMoveY: Math.random() * 2 - 1,
				p1Pos: 400,
				p2Pos: 400
			}
			newGame.p1Id = newGame.player1.user.id
			newGame.p2Id = newGame.player2.user.id

			var id;

			this.gameRepository.save(this.gameRepository.create(newGame)).then(
				(game) => {
					server.to(newGame.player1.socketId).to(newGame.player2.socketId).emit('PlayerGetMatch', game);
					this.games.push(newGame);
				}
			);
		}
	}

	gameUpdates(){
		for (let index = 0; index < this.games.length; index++) {
			var element = this.games[index];

			element.ballX += element.ballMoveX
			element.ballY += element.ballMoveY

			if (element.ballX < 50 && element.p1Pos - 10 < element.ballY && element.p1Pos + 110 > element.ballY)
			{
				element.ballX = 50;
				element.ballMoveX = (element.ballMoveX - 1) * -1;
				element.ballMoveY = Math.random() * 2 - 1;
			}

			if (element.ballX > 750 && element.p2Pos - 10 < element.ballY && element.p2Pos + 110 > element.ballY)
			{
				element.ballX = 750;
				element.ballMoveX = (element.ballMoveX + 1) * -1;
				element.ballMoveY = Math.random() * 2 - 1;
			}

			if (element.ballX < 20 || element.ballX > 780)
			{
				if (element.ballX < 20)
					element.p2Score += 1;
				else
					element.p1Score += 1;

				element.ballY = 400;
				element.ballX = 400;

				if (element.p2Score < this.winscore && element.p1Score < this.winscore)
				{
					element.ballMoveX = 4;
					element.ballMoveY = Math.random() * 2 - 1;
				}
				else
				{
					element.ballMoveX = 0;
					element.ballMoveY = 0;
					this.finishGame(element);
					this.games.splice(index, 1);
				}

			}
			if (element.ballY < 20 || element.ballY > 780)
				element.ballMoveY *= -1;



			var gameData: GameDataI = {
				p1Pos: element.p1Pos,
				p2Pos: element.p2Pos,
				ballX: element.ballX,
				ballY: element.ballY,
				p1Score: element.p1Score,
				p2Score: element.p2Score
			}

			this.server.to(element.player1.socketId).to(element.player2.socketId).emit('GameUpdate', gameData);
		}
	}

	async finishGame(game: GameI)
	{
		console.log("End of the game");
		console.log("Game score: ", game.p1Score, ":", game.p2Score);
		await this.gameRepository.save(game);

		if (game.p1Score == this.winscore)
		{
			var winer = game.player1.user;
			var looser = game.player2.user;
		}
		else
		{
			var winer = game.player2.user;
			var looser = game.player1.user;
		}

		winer.score += 100 + Math.floor((looser.score + 1) / 20)
		if (looser.score > 0)
			looser.score -= Math.floor((looser.score) / 20)

		winer.wins += 1;
		looser.losses += 1;

		await this.userService.savePlayer(winer);
		await this.userService.savePlayer(looser);

		this.server.to(game.player2.socketId).to(game.player1.socketId).emit('EndOfGame');
	}

	async gameByID(id: number){
		return this.gameRepository.findOne({
			where : {
				id
			}
		})
	}

	async winGameForPlayer(id: number){
		return this.gameRepository.find({
			where : [
				{p1Id: id, p1Score: this.winscore},
				{p2Id: id, p2Score: this.winscore}
			]
		})
	}

	async lostGameForPlayer(id: number){
		return this.gameRepository.find({
			where : [
				{p1Id: id, p2Score: this.winscore},
				{p2Id: id, p1Score: this.winscore}
			]
		})
	}
}
