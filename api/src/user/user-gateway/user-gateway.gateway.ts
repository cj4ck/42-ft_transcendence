import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from '../service/user-service/user.service';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] } })
export class UserGatewayGateway {

	@WebSocketServer()
	server: Server

	constructor(private userService: UserService) {}

	@SubscribeMessage('checkNewUsername')
	async onCheckNewUsername(socket: Socket, newUsername: string) {
		const doesExist = await this.userService.doesUsernameExist(newUsername)
		const isAvailable: boolean = !doesExist
		console.log('doesExist, isAvailable:', doesExist, isAvailable)
		this.server.to(socket.id).emit('isUsernameAvailable', doesExist)
	}

}
