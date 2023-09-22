import { Injectable } from '@angular/core';
import { CustomSocket } from '../../sockets/custom.socket';
import { RoomI, RoomPaginateI } from 'src/app/interfaces/room.interface';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: CustomSocket) { }

  sendMessage() {

  }

  getMessage() {
	return this.socket.fromEvent('message');
  }

  getMyRooms() {
	return this.socket.fromEvent<RoomPaginateI>('rooms');
  }

  emitPaginateRooms(limit: number, page: number) {
	this.socket.emit('paginateRooms', {limit, page});
  }

  createRoom() {}

	// const fakeUser: UserI = {
	// 	id: 23,
	// 	username: 'fakeUser',
	// 	email: 'fake@mail.com',
	// 	password: 'pswd',
	// }

	// const testRoom: RoomI = {
	// 	id: 22334565,
	// 	name: 'Testroom',
	// 	description: 'meh',
	// 	users: [fakeUser],
	// }

	// this.socket.emit('createRoom', testRoom);

// ORIGINAL
	// const user2: UserI = {
	// 	id:2
	// };

	// const room: RoomI = {
	// 	name: 'Testroom',
	// 	users: [user2]
	// }

	// this.socket.emit('createRoom', room);
}
