import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { generate, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'
import { LoginResponseI } from 'src/app/model/login-response.interface';
import { UserI } from 'src/app/model/user.interface'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http:HttpClient,
    private snackbar: MatSnackBar,
    private jwtService: JwtHelperService,
    private router: Router,
  ) { }

  login(user: UserI): Observable<LoginResponseI> {
    return this.http.post<LoginResponseI>('api/users/login', user).pipe(
      tap((res: LoginResponseI) => localStorage.setItem("nestjs_chat_app", res.access_token)),
      tap(() => this.snackbar.open('Login Successful', 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      }))
    );
  }

  getLoggedInUser() {
    const decodedToken = this.jwtService.decodeToken()
    return <UserI>decodedToken.user;
  }

  logout() {
    localStorage.removeItem("nestjs_chat_app");
    this.router.navigate(['/public/login'])
  }

  initialize2fa() {
    return this.http.get('api/auth/2fa/generate');
  }

  verifySetup(code: string, secret: string): Observable<boolean> {
    const url = 'api/auth/2fa/verify';
    const body = { token: code, secret: secret };
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

  verify42TwoFactorToken(token: string): Observable<LoginResponseI> {
    const body = { token };
    return this.http.post<LoginResponseI>('/api/auth/42/2fa/verify', body);
  }
  
  isTwoFactorEnabled() {
    return this.http.get('api/auth/2fa/enabled');
  }
}
