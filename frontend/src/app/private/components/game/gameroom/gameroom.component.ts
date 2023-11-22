import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class GameroomComponent implements OnInit, OnDestroy{
    id: string;
    private sub: any;
    game: GameI;
    player1: UserI
    player2: UserI

    @ViewChild("myCanvas", { static: false }) myCanvas: ElementRef;

    gameData: GameDataI = {p1Pos: 0, p2Pos: 0, ballX:0, ballY: 0};

    constructor(private route: ActivatedRoute,
                private gameService: GameService,
                private userService: UserService,
                private socket: CustomSocket
                ) {
                  socket.on("GameUpdate", (gameData) => this.updateGame(gameData))
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

      this.gameData = gameData

      const canvasEl: HTMLCanvasElement = this.myCanvas.nativeElement;
      var context = canvasEl.getContext("2d");

      context.clearRect(0,0,400,400)

      context.beginPath();
      context.arc(gameData.ballX, gameData.ballY, 10, 0, Math.PI*2);
      context.fillStyle = 'FFFFFF';
      context.fill();
      context.closePath();

      context.fillRect(15, gameData.p1Pos, 25, 100);
      context.fillRect(360, gameData.p2Pos, 25, 100);

      window.requestAnimationFrame(() => {});
    }

    ngOnDestroy() {
      this.sub.unsubscribe();
    }
}

