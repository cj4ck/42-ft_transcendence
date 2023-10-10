import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {

  constructor(private gameService: GameService) {}

  playersWaiting: number = 0;

  joinQueqe(){
    this.gameService.joinGame();
    this.playersWaiting += 1;
  }
}
