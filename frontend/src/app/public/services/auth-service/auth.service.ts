import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'
import { LoginChatroomResponseI } from 'src/app/model/login-chatroom-response.interface';
import { LoginResponseI } from 'src/app/model/login-response.interface';
import { RoomI } from 'src/app/model/room.interface';
import { UserI } from 'src/app/model/user.interface'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient, private snackbar: MatSnackBar, private jwtService: JwtHelperService) { }

  login(user: UserI): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>('api/users/login', user).pipe(
      tap((res: LoginResponseI) => localStorage.setItem("user token", res.access_token)),
      tap(() => this.snackbar.open('Login Successful', 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      }))
    );
  }

  getLoggedInUser() {
    const decodedToken = this.jwtService.decodeToken()
    return decodedToken.user
  }

  loginChatroom(room: RoomI, password: string): Observable<LoginChatroomResponseI> {
	const requestBody = { room, password }
	return this.http.post<LoginChatroomResponseI>('api/users/loginChatroom', requestBody).pipe(
		tap((res: LoginChatroomResponseI) => localStorage.setItem("nest_js_chat_app", res.access_token)),
		tap(() => this.snackbar.open('Entered Chatroom successfully', 'Close', {
			duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
		  }))
	)
  }

}