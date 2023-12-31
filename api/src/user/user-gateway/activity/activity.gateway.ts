import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/service/user-service/user.service';

@WebSocketGateway()
export class ActivityGateway implements  OnGatewayDisconnect{

  constructor(private userService: UserService) {}

  @SubscribeMessage('UserConnect')
  async hello(socket: Socket, userID: number){
    var user = await this.userService.findById(userID);
    if (user?.activityStatus != 'in game')
      await this.userService.userOnline(userID);
  }

  @SubscribeMessage('Disconnect')
  async gameDisconnect(socket: Socket, userID: number){
    await this.userService.userOffline(userID);
  }

  async handleDisconnect(socket: Socket) {
    await this.userService.userOffline(socket.data.user?.id);
  }

}
