import { Injectable } from '@angular/core';
import { CustomSocket } from '../sockets/custom-socket';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: CustomSocket) { }

  joinGame(changeWaitingPlayers) {
    this.socket.emit('PlayerJoinQueue', changeWaitingPlayers);
  }

  leaveGame(changeWaitingPlayers) {
    this.socket.emit('PlayerLeaveQueue', changeWaitingPlayers);
  }
}
