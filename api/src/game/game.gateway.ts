import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class GameGateway {

  @SubscribeMessage('PlayerJoinQueue')
  JoinQueue(socket: Socket){
    console.log("player " + socket.data.user.username + " join queue");
  }

}
