import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserI } from 'src/user/model/user.interface';
import { GameService } from './game.service';

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class GameGateway implements OnGatewayDisconnect {

  constructor(private gameService: GameService) {}

  handleDisconnect(socket: Socket) {
    const index = this.gameService.queue.indexOf(socket.data.user, 0);
    if (index > -1)
    {
      console.log("player " + socket.data.user.username + " leave queue");
      this.gameService.queue.splice(index, 1);
      this.server.emit('PlayerInQueueChange', this.gameService.queue.length);
    }
    socket.disconnect();
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('PlayerJoinQueue')
  JoinQueue(socket: Socket){
    console.log("player " + socket.data.user.username + " join queue");
    if (!this.gameService.queue.some((user) => user.id == socket.data.user.id))
    {
      this.gameService.queue.push(socket.data.user);
      //this.gameService.lookForGamePair();
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



}
