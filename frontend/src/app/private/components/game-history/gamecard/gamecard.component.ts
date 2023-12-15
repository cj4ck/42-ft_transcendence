import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameI } from 'src/app/model/game.interface';
import { UserI } from 'src/app/model/user.interface';
import { GameService } from 'src/app/private/services/game.service';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-gamecard',
  templateUrl: './gamecard.component.html',
  styleUrls: ['./gamecard.component.css']
})
export class GamecardComponent implements OnInit{

  @Input()
  id : number

  defaultAvatarUrl = '../../../assets/defaultAvatar.png';
  player1: UserI
  player2: UserI

  game: GameI;

  player1rank: string
  player2rank: string

  constructor (private route: ActivatedRoute,
              private gameService: GameService,
              private userService: UserService,
              private router: Router){}

  async ngOnInit() {
    this.gameService.findById(this.id).subscribe(
      (game) => {
          if (!game)
          {
            this.router.navigate(['private/players']);
            return;
          }
          this.game = game;
          this.userService.findByID(game.p1Id).subscribe( p => {this.player1 = p; this.setPlayerRank();})
          this.userService.findByID(game.p2Id).subscribe( p => {this.player2 = p; this.setPlayerRank();})
        });
    }

  setPlayerRank() {
    var rank_icons = ["https://cdn3.emoji.gg/emojis/7574-iron.png", "https://cdn3.emoji.gg/emojis/1184-bronze.png",
        "https://cdn3.emoji.gg/emojis/7455-silver.png", "https://cdn3.emoji.gg/emojis/1053-gold.png", "https://cdn3.emoji.gg/emojis/3978-platinum.png",
        "https://cdn3.emoji.gg/emojis/1053-diamond.png", "https://cdn3.emoji.gg/emojis/9231-master.png", "https://cdn3.emoji.gg/emojis/9476-grandmaster.png",
        "https://cdn3.emoji.gg/emojis/9476-challenger.png"];

    if (!this.player1 || !this.player2)
      return

    var p1 = Math.min(Math.floor(this.player1.score / 1000), 8);
    var p2 = Math.min(Math.floor(this.player2.score / 1000), 8);

    this.player1rank = rank_icons[p1];
    this.player2rank = rank_icons[p2];
  }
}
