import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/service/user-service/user.service';

@WebSocketGateway()
export class ActivityGateway implements  OnGatewayDisconnect{

  constructor(private userService: UserService) {}

  @SubscribeMessage('UserConnect')
  async hello(socket: Socket, userID: number){
    await this.userService.userOnline(userID);
  }

  async handleDisconnect(socket: Socket) {
    await this.userService.userOffline(socket.data.user?.id);
  }

}
