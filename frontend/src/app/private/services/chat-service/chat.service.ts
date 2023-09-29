import { Injectable } from '@angular/core';
import { CustomSocket } from '../../sockets/custom.socket';
import { RoomI, RoomPaginateI } from 'src/app/interfaces/room.interface';
import { UserI } from 'src/app/model/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: CustomSocket, private snackbar: MatSnackBar) { }

  sendMessage() {

  }

  getMessage() {
	return this.socket.fromEvent('message');
  }

  getMyRooms(): Observable<RoomPaginateI> {
	console.log(this.socket.fromEvent<RoomPaginateI>('rooms'));
	return this.socket.fromEvent<RoomPaginateI>('rooms');
  }

  emitPaginateRooms(limit: number, page: number) {
	this.socket.emit('paginateRooms', {limit, page});
	console.log('paginate rooms emited');
  }

  createRoom(room: RoomI) {
	this.socket.emit('createRoom', room);
	this.snackbar.open(`Room ${room.name} created succesfully`, 'Close', {
		duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
	});
	console.log('chat-service', room.name);
  }
}
