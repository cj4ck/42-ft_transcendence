import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserI } from 'src/user/model/user.interface';
import { GameService } from './game.service';
import { GameI } from './model/game.interface';
import { UserService } from 'src/user/service/user-service/user.service';

@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://10.12.18.110:3000', 'http://localhost:4200', 'http://10.12.18.110:4200'] } })
export class GameGateway implements OnGatewayDisconnect {

  constructor(private gameService: GameService, private userService: UserService) { }

  handleDisconnect(socket: Socket) {

    var availablePlayerIndex  = this.gameService.availablePlayers.findIndex((val) => val.socketId == socket.id);
    if (availablePlayerIndex > -1)
      this.gameService.availablePlayers.splice(availablePlayerIndex, 1);

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
      q.splice(indexQueue, 1);
      this.server.emit('PlayerInQueueChange', this.gameService.queue.length + this.gameService.quick_queue.length);
    }
    else if (playerGame != undefined) {
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
    if (!this.gameService.queue.some((player) => player.user.id == socket.data.user.id)) {
      if (quickGame) {
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

  @SubscribeMessage('UserConnect')
  PlayerIsAvailable(socket: Socket, userID: number)
  {
    if (this.gameService.availablePlayers.findIndex((el) => el.socketId == socket.id) < 0)
      this.gameService.availablePlayers.push({socketId: socket.id, userID: userID});
  }

  @SubscribeMessage('PlayerWannaDuel')
  PlayerWannaDuel(socket: Socket, ids: number[]){
    //* ids[0] - guest ID
    //* ids[1] - host ID

    var guest_socket_id = this.gameService.availablePlayers.find((val) => val.userID == ids[0])?.socketId

    if (guest_socket_id != null)
    {
      this.server.to(guest_socket_id).emit("GameInvitation", ids[1]);
    }
  }

  @SubscribeMessage('DuelTime')
  async DuelTime(socket: Socket, ids: number[]){
    var p1_socet_id = this.gameService.availablePlayers.find((val) => val.userID == ids[0])?.socketId;
    var p2_socet_id = this.gameService.availablePlayers.find((val) => val.userID == ids[1])?.socketId;

    var user1 = await this.userService.findById(ids[0]);
    var user2 = await this.userService.findById(ids[1]);

    var newGame: GameI = {

      player1: {socketId: p1_socet_id, user: user1, quickGame: false},
      player2: {socketId: p2_socet_id, user: user2, quickGame: false},
      p1Score: 0,
      p2Score: 0,
      ballX: 400,
      ballY: 400,
      ballMoveX: 4,
      ballMoveY: Math.random() * 2 - 1,
      p1Pos: 400,
      p2Pos: 400
    }

    this.gameService.createGame(newGame, this.server);
  }
}
