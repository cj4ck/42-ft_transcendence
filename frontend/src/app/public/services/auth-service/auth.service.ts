import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'
import { LoginResponseI } from 'src/app/model/login-response.interface';
import { RoomI } from 'src/app/model/room.interface';
import { UserI } from 'src/app/model/user.interface'
import { CustomSocket } from 'src/app/private/sockets/custom-socket';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private jwtService: JwtHelperService,
    private router: Router,
    private socket: CustomSocket,
  ) { }

  login(user: UserI): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>('api/users/login', user).pipe(
      tap((res: LoginResponseI) => localStorage.setItem("pentacode", res.access_token)),
      tap(() => this.snackbar.open('Login Successful', 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      }))
    );
  }

  getLoggedInUser() {
    const token = localStorage.getItem("pentacode");

    if (token && token != 'undefined') {
      const decodedToken = this.jwtService.decodeToken(token);
      return <UserI>decodedToken?.user;
    }
    return null;
  }

  logout() {
    this.socket.emit("Disconnect", this.getLoggedInUser().id);
    localStorage.removeItem("pentacode");
    this.router.navigate(['/public/login']);
  }

  initialize2fa() {
    return this.http.get('api/auth/2fa/generate');
  }

  verifySetup(code: string): Observable<boolean> {
    const url = 'api/auth/2fa/verify';
    const body = { token: code };
    return this.http.post<{ success: boolean }>(url, body).pipe(
      tap((response) => {
      }),
      map((response) => response.success),
      catchError((error) => {
        console.error('Verification failed', error);
        return of(false);
      })
    );
  }

  disableTwoFactorToken(code: string): Observable<boolean> {
    const url = 'api/auth/2fa/disable';
    const body = { token: code };
    return this.http.post<{ success: boolean }>(url, body).pipe(
      tap((response) => {
      }),
      map((response) => response.success),
      catchError((error) => {
        console.error('Verification failed', error);
        return of(false);
      })
    );
  }

  verifyTwoFactorToken(twoFactorAuthCode: string, email: string): Observable<LoginResponseI> {
    const body = { twoFactorAuthCode, email };
    return this.http.post<LoginResponseI>('/api/users/2fa/verify-status', body);
  }

  verify42TwoFactorToken(token: string, email: string): Observable<LoginResponseI> {
    const body = { token, email };
    return this.http.post<LoginResponseI>('/api/auth/42/2fa/verify', body);
  }

  isTwoFactorEnabled() {
    return this.http.get('api/auth/2fa/enabled');
  }

  async loginChatroom(room: RoomI, password: string): Promise<boolean> {
    const requestBody = { room, password }
    return this.http.post<boolean>('api/users/loginChatroom', requestBody).pipe(
      tap(() => this.snackbar.open('Entered Chatroom successfully', 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      })), catchError((err, caught) => { return EMPTY })
    ).toPromise()
  }

}
