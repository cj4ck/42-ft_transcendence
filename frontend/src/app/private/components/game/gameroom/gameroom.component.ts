import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GameDataI } from 'src/app/model/game-data.interface';
import { GameI } from 'src/app/model/game.interface';
import { UserI } from 'src/app/model/user.interface';
import { GameService } from 'src/app/private/services/game.service';
import { CustomSocket } from 'src/app/private/sockets/custom-socket';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-gameroom',
  templateUrl: './gameroom.component.html',
  styleUrls: ['./gameroom.component.css']
})
export class GameroomComponent implements OnInit, OnDestroy, AfterViewInit{
    id: string;
    private sub: any;
    game: GameI;
    player1: UserI
    player2: UserI
    context: CanvasRenderingContext2D
    player1rank: string
    player2rank: string
    gameData: GameDataI

    canvas_size = 800
    ball_radius = 15
    player_w = 25
    player_h = 100

    @ViewChild("myCanvas", { static: false }) myCanvas: ElementRef;
    defaultAvatarUrl = '../../../assets/defaultAvatar.png';

    constructor(private route: ActivatedRoute,
                private gameService: GameService,
                private userService: UserService,
                private socket: CustomSocket,
                private snackbar: MatSnackBar,
                private router: Router
                )
    {
      socket.on("GameUpdate", (gameData) => this.updateGame(gameData));
      socket.on("EndOfGame", () => {
        this.snackbar.open(`The match end`, 'Close', { duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'})
        this.router.navigate(['private/game/'])
      });

    }

    ngAfterViewInit(): void {
      const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
      this.context = canvasEl.getContext("2d");
    }

    async ngOnInit() {
      this.sub = this.route.params.subscribe(params => {
        this.id = params['id'];
        this.gameService.findById(+this.id).subscribe(
          (game) => {
            if (!game)
            {
              this.router.navigate(['private/game/']);
              return;
            }
            this.game = game;
            this.userService.findByID(game.p1Id).subscribe( p => {this.player1 = p; this.setPlayerRank();})
            this.userService.findByID(game.p2Id).subscribe( p => {this.player2 = p; this.setPlayerRank();})
          });
        });

      }

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
      event.preventDefault();
      if(event.key == "ArrowUp")
      {
        this.socket.emit("PlayerUp")
      }
      else if(event.key == "ArrowDown")
      {
        this.socket.emit("PlayerDown")
      }
    }

    updateGame(gameData: GameDataI)
    {
      this.gameData = gameData;

      this.context.clearRect(0,0,this.canvas_size,this.canvas_size)
      this.context.beginPath();
      this.context.arc(gameData.ballX, gameData.ballY, this.ball_radius, 0, Math.PI*2);
      this.context.fillStyle = "#558B6E";
      this.context.fill();
      this.context.closePath();

      this.context.fillStyle = "#6b7fd7";
      this.context.fillRect(this.ball_radius, gameData.p1Pos, this.player_w, this.player_h);
      this.context.fillStyle = "#ee6352";
      this.context.fillRect(this.canvas_size - this.ball_radius - this.player_w, gameData.p2Pos, this.player_w, this.player_h);

      window.requestAnimationFrame(() => {});
    }

    ngOnDestroy() {
      this.sub.unsubscribe();
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

