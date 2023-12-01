import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { tokenGetter } from 'src/app/app.module';
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

    ngOnInit() {
      this.sub = this.route.params.subscribe(params => {
        this.id = params['id'];
        this.gameService.findById(+this.id).subscribe(
          game => {
            this.game = game;
            this.userService.findByID(game.p1Id).subscribe( p => this.player1 = p)
            this.userService.findByID(game.p2Id).subscribe( p => this.player2 = p)
          }
          );
        });

      }

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
      console.log(event.key)
    if(event.key == "ArrowUp"){
      this.socket.emit("PlayerUp")
    }else if(event.key == "ArrowDown"){
      this.socket.emit("PlayerDown")
    }
  }

    updateGame(gameData: GameDataI)
    {

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

}

