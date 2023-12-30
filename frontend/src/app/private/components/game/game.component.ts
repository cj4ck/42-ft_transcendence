import { Component, HostListener, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CustomSocket } from '../../sockets/custom-socket';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ComponentCanDeactivate } from 'src/app/guards/pending-changes.guard';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, ComponentCanDeactivate {

  quickGame: boolean;
  theme: ThemePalette = "warn"

  checkCheckBoxvalue(event){
    this.quickGame = event.checked;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    this.leaveQueqe();
    return true;
  }

  constructor(
    private gameService: GameService,
    private socket: CustomSocket,
    private snackbar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    socket.on("PlayerInQueueChange", (nbr) => this.changeWaitingPlayers(nbr))
    socket.on("PlayerGetMatch", (new_game) => {
      console.log(new_game);
      this.snackbar.open(`U get match`, 'Close', { duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' })
      this.router.navigate(['private/gameroom/' + new_game.id])
    })
  }

  ngOnInit(): void {
    this.socket.emit("GameConnect", this.authService.getLoggedInUser().id)
  }

  playersWaiting: number = 0;
  playerIsInQueue = false;

  joinQueqe() {

    this.gameService.joinGame(this.changeWaitingPlayers, this.quickGame);
    this.playerIsInQueue = true;
  }

  leaveQueqe() {
    this.gameService.leaveGame(this.changeWaitingPlayers);
    this.playerIsInQueue = false;
  }

  changeWaitingPlayers(nbr: number) {
    this.playersWaiting = nbr;
  }
}
