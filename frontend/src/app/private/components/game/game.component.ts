import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CustomSocket } from '../../sockets/custom-socket';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {

  constructor(private gameService: GameService, private socket: CustomSocket) {
    socket.on("PlayerInQueueChange", (nbr) => this.changeWaitingPlayers(nbr) )
  }

  playersWaiting: number = 0;
  playerIsInQueue = false;

  joinQueqe(){
    this.gameService.joinGame(this.changeWaitingPlayers);
    this.playerIsInQueue = true;
  }

  leaveQueqe(){
    this.gameService.leaveGame(this.changeWaitingPlayers);
    this.playerIsInQueue = false;
  }

  changeWaitingPlayers(nbr: number) {
    this.playersWaiting = nbr;
    console.log("aaaaaa");
  }
}
