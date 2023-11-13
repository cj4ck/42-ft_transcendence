import { Injectable } from '@angular/core';
import { CustomSocket } from '../../sockets/custom-socket';
import { RoomI, RoomPaginateI } from 'src/app/model/room.interface';
import { UserI } from 'src/app/model/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { MessageI, MessagePaginateI } from 'src/app/model/message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: CustomSocket, private snackbar: MatSnackBar) { }

  getAddedMessage(): Observable<MessageI> {
    return this.socket.fromEvent<MessageI>('messageAdded')
  }

  sendMessage(message: MessageI) {
    // console.log('message send emit')
    this.socket.emit('addMessage', message)
  }

  joinRoom(room: RoomI) {
    this.socket.emit('joinRoom', room)
  }

  leaveRoom(room: RoomI) {
    this.socket.emit('leaveRoom', room)
  }

  getMessages(): Observable<MessagePaginateI> {
    return this.socket.fromEvent<MessagePaginateI>('messages');
  }

  getMyRooms(): Observable<RoomPaginateI> {
    return this.socket.fromEvent<RoomPaginateI>('rooms')
  }

  emitPaginateRooms(limit: number, page: number){
    this.socket.emit('paginateRooms', {limit, page})
  }

  createRoom(room: RoomI) {
    this.socket.emit('createRoom', room)
    this.snackbar.open(`Room ${room.name} created succesfully`, 'Close', {
      duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
    });
  }

  createDmRoom(username: string) {
    this.socket.emit('createDmRoom', username)
    // this.snackbar.open(`Room ${room.name} created succesfully`, 'Close', {
    //   duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
    // });
  }

  toggleUserBlock(user: UserI) {
    this.socket.emit('toggleUserBlock', user)
  }

  toggleRoomAdmin(room: RoomI) {
    this.socket.emit('toggleRoomAdmin', room)
  }

  setChatPassword(room: RoomI): Observable<RoomI> {
	return this.socket.emit('setChatPassword', room)
  }

  removeChatPassword(roomId: number) {
	return this.socket.emit('removeChatPassword', roomId)
  }

  //useless
  // checkPasswordService(room: RoomI) {
	//   this.socket.emit('checkPasswordReq', room)
  // }

  // getActiveChatPassword(): Observable<string> {
	//   return this.socket.fromEvent<string>('checkPasswordRes')
  // }

  getBlockedUsers(user_id: number): Observable<number[]> {
    // console.log('get blocked users chat.service')
    // this.socket.emit('getBlockedUsers', user_id)
    return this.socket.fromEvent<number[]>('checkBlockedRes')
  }

  getChatroomInfo(roomId: number): Observable<RoomI> {
	  this.socket.emit('getChatroomInfo', roomId)
	  return this.socket.fromEvent('hereYouGo')
  }

  // getRoomAdmins(room_id: number): Observable<number[]> {
  //   // console.log('get blocked users chat.service')
  //   // this.socket.emit('getBlockedUsers', user_id)
  //   return this.socket.fromEvent<number[]>('checkAdminList')
  // }

  returnUpdatedRoom(): Observable<RoomI> {
	  return this.socket.fromEvent('updatedRoom')
  }
}
