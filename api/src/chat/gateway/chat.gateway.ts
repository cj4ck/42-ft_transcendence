import { UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { RoomService } from '../service/room-service/room.service';
import { RoomI } from '../model/room.interface';
import { PageI } from '../model/page.interface';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { ConnectedUserI } from '../model/connected-user.interface';
import { Console } from 'console';

@WebSocketGateway({
  cors: {
    origin: [
      'https://hoppscotch.io',
      'http://localhost:3000',
      'http://localhost:4200',
    ],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

	// private readonly newProperty = 'paginateRoom';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
	private connectedUserService: ConnectedUserService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(
        socket.handshake.headers.authorization
      );
      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, {
          page: 1,
          limit: 10,
        });
		rooms.meta.currentPage = rooms.meta.currentPage - 1; //subtract one to match angular material paginator

		//Save connection to database
		await this.connectedUserService.create({socketId: socket.id, user});

        //only emit rooms to specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
	//remove connection from db
	await this.connectedUserService.deleteBySocketId(socket.id); //ex when user closes browser
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
	console.log('disconnect');
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  //   async onCreateRoom(socket: Socket, room: RoomI): Promise<RoomI> {
	  // 	return this.roomService.createRoom(room, socket.data.user);
	@SubscribeMessage('createRoom')
  	async onCreateRoom(socket: Socket, room: RoomI) {
		console.log('anything?????');

	const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
	console.log('chat.gateway.ts', createdRoom);

	for(const user of createdRoom.users) {
		const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
		const rooms = await this.roomService.getRoomsForUser(user.id, {page: 1, limit: 10});
		for (const connection of connections) {
			await this.server.to(connection.socketId).emit('rooms', rooms);
		}
	}
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
	page.limit = page.limit > 100 ? 100: page.limit;
	console.log('pagianionsnn', socket.data.user);
	//add page +1 to match angular material paginator
	page.page = page.page + 1;
	const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, page);
	rooms.meta.currentPage = rooms.meta.currentPage - 1;
	return this.server.to(socket.id).emit('rooms', rooms);
  }
}
