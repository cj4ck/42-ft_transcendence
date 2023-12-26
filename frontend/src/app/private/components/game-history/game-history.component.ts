import { Component, OnInit } from '@angular/core';
import { GameI } from 'src/app/model/game.interface';
import { GameService } from '../../services/game.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.css']
})
export class GameHistoryComponent implements OnInit{

  winGames: GameI[];
  lostGames: GameI[];

  playerID: number;

  constructor(private gameService: GameService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.playerID = params["id"];
      this.gameService.getWinGamesForPlayer(this.playerID).subscribe(
        (games) => this.winGames = games
      );
      this.gameService.getLostGamesForPlayer(this.playerID).subscribe(
        (games) => this.lostGames = games
      );
    })
  }
}
