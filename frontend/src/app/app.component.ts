import { Component, OnInit } from '@angular/core';
import { CustomSocket } from './private/sockets/custom-socket';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './public/services/auth-service/auth.service';
import { UserService } from './public/services/user-service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(
    private socket: CustomSocket,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private userService: UserService,
    private router: Router) {
    socket.on("GameInvitation", (host_player_id) => {
      userService.findByID(host_player_id).subscribe(
        (user) => {
          let ref = this.snackbar.open(`You get Invitation to game from ` + user.username, 'Accept', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top' });
          ref.onAction().subscribe(() => {
            socket.emit("DuelTime", user.id, authService.getLoggedInUser().id);
          });
        }
      );
    })

    socket.on("PlayerGetMatch", (new_game) => {
      this.snackbar.open(`U get match`, 'Close', { duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' })
      this.router.navigate(['private/gameroom/' + new_game.id])
    })
  }

  ngOnInit(): void {
    setInterval(() => {
      if (this.authService.getLoggedInUser() != null)
      {
        var i = this.socket.connect();
        console.log('check 1', i.connected);
        this.socket.emit("UserConnect", this.authService.getLoggedInUser().id);
      }
    }, 5000)
  }
}
