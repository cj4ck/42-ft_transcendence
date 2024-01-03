import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { CustomSocket } from '../../sockets/custom-socket';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private socket: CustomSocket, 
	private snackbar: MatSnackBar, 
	private http: HttpClient
  ) {}

  ngOnInit() {
	var user = this.authService.getLoggedInUser()
	if (user.fresh) {
		this.http.post('users/fresh', user.id).subscribe()
		let ref = this.snackbar.open(`Please, change your username and avatar `, 'Go to settings', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top' });
          ref.onAction().subscribe(() => {
			this.router.navigate(['../user-settings'])
          });
	}
  }

  logout(){
    this.authService.logout();
  }
}
