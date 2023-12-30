import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserI } from 'src/user/model/user.interface';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class GameGateway implements OnGatewayDisconnect {

  constructor(private gameService: GameService) { }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    var q = this.gameService.queue;
    var indexQueue = q.indexOf(user, 0);
    if (indexQueue < 0)
    {
      var q = this.gameService.quick_queue;
      indexQueue = q.indexOf(user, 0);
    }

    const playerGame = this.gameService.games.find((game) => game.player1.user == user || game.player2.user == user)

    if (indexQueue > -1) {
      console.log("player " + socket.data.user.username + " leave queue");
      q.splice(indexQueue, 1);
      this.server.emit('PlayerInQueueChange', this.gameService.queue.length + this.gameService.quick_queue.length);
    }
    else if (playerGame != undefined) {
      console.log("Player " + socket.data.user.username + " quit game");

      if (playerGame.player1.user == user) {
        playerGame.p2Score = this.gameService.winscore;
      }
      else {
        playerGame.p1Score = this.gameService.winscore;
      }

      this.gameService.finishGame(playerGame);

    }
    socket.disconnect();
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('PlayerJoinQueue')
  JoinQueue(socket: Socket, quickGame: boolean) {
    console.log("player " + socket.data.user.username + " join queue");
    if (!this.gameService.queue.some((player) => player.user.id == socket.data.user.id)) {
      if (quickGame) {
        console.log("New quick game")
        this.gameService.quick_queue.push(
          {
            user: socket.data.user,
            socketId: socket.id,
            quickGame
          });
          this.gameService.lookForGamePair(this.server, this.gameService.quick_queue);
      }
      else {
        this.gameService.queue.push(
          {
            user: socket.data.user,
            socketId: socket.id,
            quickGame
          });
          this.gameService.lookForGamePair(this.server, this.gameService.queue);
      }

    }
    this.server.emit('PlayerInQueueChange', this.gameService.queue.length + this.gameService.quick_queue.length);
  }

  @SubscribeMessage('PlayerLeaveQueue')
  LeaveQueue(socket: Socket) {
    var q = this.gameService.queue;
    var index = q.findIndex((user) => user.socketId == socket.id);
    if (index < 0)
    {
      q = this.gameService.quick_queue;
      index = q.findIndex((user) => user.socketId == socket.id);
    }
    if (index > -1) {
      console.log("player " + socket.data.user.username + " leave queue");
      q.splice(index, 1);
      this.server.emit('PlayerInQueueChange', this.gameService.queue.length + this.gameService.quick_queue.length);
    }

  }

  @SubscribeMessage('PlayerUp')
  PlayerUP(socket: Socket) {
    if (this.gameService.games.some((game) => game.player1.user.id == socket.data.user.id)) {
      var game = this.gameService.games.find((game) => game.player1.user.id == socket.data.user.id)
      if (game.p1Pos > 0)
        game.p1Pos -= 10;
    }
    if (this.gameService.games.some((game) => game.player2.user.id == socket.data.user.id)) {
      var game = this.gameService.games.find((game) => game.player2.user.id == socket.data.user.id)
      if (game.p2Pos > 0)
        game.p2Pos -= 10;
    }
  }

  @SubscribeMessage('PlayerDown')
  PlayerDown(socket: Socket) {
    if (this.gameService.games.some((game) => game.player1.user.id == socket.data.user.id)) {
      var game = this.gameService.games.find((game) => game.player1.user.id == socket.data.user.id)
      if (game.p1Pos < 700)
        game.p1Pos += 10;
    }
    if (this.gameService.games.some((game) => game.player2.user.id == socket.data.user.id)) {
      var game = this.gameService.games.find((game) => game.player2.user.id == socket.data.user.id)
      if (game.p2Pos < 700)
        game.p2Pos += 10;
    }
  }


}
