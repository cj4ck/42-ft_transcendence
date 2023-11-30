import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserI } from 'src/user/model/user.interface';
import { GameService } from './game.service';

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class GameGateway implements OnGatewayDisconnect {

  constructor(private gameService: GameService) {}

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    const indexQueue = this.gameService.queue.indexOf(user, 0);
    const playerGame = this.gameService.games.find((game) => game.player1.user == user || game.player2.user == user)
    if (indexQueue > -1)
    {
      console.log("player " + socket.data.user.username + " leave queue");
      this.gameService.queue.splice(indexQueue, 1);
      this.server.emit('PlayerInQueueChange', this.gameService.queue.length);
    }
    else if (playerGame != undefined)
    {
      console.log("Player " + socket.data.user.username + " quit game");

      if (playerGame.player1.user == user)
      {
        playerGame.p2Score = this.gameService.winscore;
      }
      else
      {
        playerGame.p1Score = this.gameService.winscore;
      }

      this.gameService.finishGame(playerGame);

    }
    socket.disconnect();
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('PlayerJoinQueue')
  JoinQueue(socket: Socket){
    console.log("player " + socket.data.user.username + " join queue");
    if (!this.gameService.queue.some((player) => player.user.id == socket.data.user.id))
    {
      this.gameService.queue.push(
        {
          user: socket.data.user,
          socketId: socket.id
        });
      this.gameService.lookForGamePair(this.server);
    }
    this.server.emit('PlayerInQueueChange', this.gameService.queue.length);
  }

  @SubscribeMessage('PlayerLeaveQueue')
  LeaveQueue(socket: Socket){
    console.log("player " + socket.data.user.username + " leave queue");

    const index = this.gameService.queue.indexOf(socket.data.user, 0);
    if (index > -1)
    {
      console.log("player " + socket.data.user.username + " leave queue");
      this.gameService.queue.splice(index, 1);
      this.server.emit('PlayerInQueueChange', this.gameService.queue.length);
    }

  }

  @SubscribeMessage('PlayerUp')
  PlayerUP(socket: Socket){
    if (this.gameService.games.some((game) => game.player1.user.id == socket.data.user.id))
    {
      var game = this.gameService.games.find((game) => game.player1.user.id == socket.data.user.id)
      if (game.p1Pos > 0)
        game.p1Pos -= 10;
    }
    if (this.gameService.games.some((game) => game.player2.user.id == socket.data.user.id))
    {
      var game = this.gameService.games.find((game) => game.player2.user.id == socket.data.user.id)
      if (game.p2Pos > 0)
        game.p2Pos -= 10;
    }
  }

  @SubscribeMessage('PlayerDown')
  PlayerDown(socket: Socket){
    if (this.gameService.games.some((game) => game.player1.user.id == socket.data.user.id))
    {
      var game = this.gameService.games.find((game) => game.player1.user.id == socket.data.user.id)
      if (game.p1Pos < 300)
      game.p1Pos += 10;
    }
    if (this.gameService.games.some((game) => game.player2.user.id == socket.data.user.id))
    {
      var game = this.gameService.games.find((game) => game.player2.user.id == socket.data.user.id)
      if (game.p2Pos < 300)
        game.p2Pos += 10;
    }
  }


}
