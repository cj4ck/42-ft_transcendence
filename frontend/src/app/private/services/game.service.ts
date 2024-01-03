import { Injectable } from '@angular/core';
import { CustomSocket } from '../sockets/custom-socket';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GameI } from 'src/app/model/game.interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: CustomSocket, private http: HttpClient) { }

  joinGame(changeWaitingPlayers, quickGame) {
    this.socket.emit('PlayerJoinQueue', quickGame);
  }

  leaveGame(changeWaitingPlayers) {
    this.socket.emit('PlayerLeaveQueue', changeWaitingPlayers);
  }

  findById(id: number): Observable<GameI> {
    return this.http.get<GameI>(`api/game/game?id=${id}`)
  }

  getWinGamesForPlayer(id: number): Observable<GameI[]> {
    return this.http.get<GameI[]>(`api/game/wingames?id=${id}`)
  }

  getLostGamesForPlayer(id: number): Observable<GameI[]> {
    return this.http.get<GameI[]>(`api/game/lostgames?id=${id}`)
  }

  fightAgainstUser(id_guest: number, host_id: number){
    this.socket.emit('PlayerWannaDuel', id_guest, host_id);
  }
}
