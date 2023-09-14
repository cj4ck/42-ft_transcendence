import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { AuthService } from 'src/auth/service/auth.service';
import { Socket, Server } from 'socket.io'
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { UnauthorizedException } from '@nestjs/common';
@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] } })

export class ChatGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  title: string[] = [];

  constructor(private authService: AuthService, private UserService: UserService) {}
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any) {
  //   this.server.emit('message');
  // }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization)
      const user: UserI = await this.UserService.getOne(decodedToken.user.id)
      if (!user) {
        return this.disconnect(socket)
      } else {
        this.title.push('Value ' + Math.random().toString())
        this.server.emit('message', this.title);
      }
    }
    catch {
      return this.disconnect(socket)
    }
  }

  handleDisconnect(socket: Socket) {
    socket.disconnect();
    console.log('On Disconnect');
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}
