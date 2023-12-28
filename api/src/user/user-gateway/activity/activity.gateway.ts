import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ActivityGateway implements OnGatewayConnection, OnGatewayDisconnect{

  handleConnection(socket: Socket) {
    console.log("User conect " + socket.data.user)
  }

  @SubscribeMessage('hello')
  hello(socket: Socket){
    console.log("Hello")
  }

  handleDisconnect(socket: Socket) {
    console.log("User disconect " + socket.data.user)
  }

}
