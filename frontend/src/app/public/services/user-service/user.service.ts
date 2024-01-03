import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { UserI } from '../../../model/user.interface';
import { catchError, tap } from 'rxjs/operators';
import { CustomSocket } from 'src/app/private/sockets/custom-socket';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
    private snackbar: MatSnackBar,
    private socket: CustomSocket) { }

  getAllUsers() {
    return this.http.get<UserI[]>(`api/users/`)
  }
findByUsername
  (username: string): Observable<UserI[]> {
    return this.http.get<UserI[]>(`api/users/find-by-username?username=${username}`)
  }

  findByID(id: number): Observable<UserI> {
    return this.http.get<UserI>(`api/users/find-by-id?id=${id}`)
  }

  create(user: UserI): Observable<UserI> {
    return this.http.post<UserI>('api/users', user).pipe(
      tap((createdUser: UserI) => this.snackbar.open(`User ${createdUser.username} created succesfully`, 'Close', {
        duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
      })),
      catchError(e => {
        this.snackbar.open(`User could not be created, due to: ${e.error.message}`, 'Close', {
          duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
        })
        return throwError(e);
      })
    )
  }

  changeUsername(user: UserI): Observable<boolean> {
    return this.http.post<boolean>('api/users/changeUsername', user).pipe(
      tap((success: boolean) => {
        if (success) {
          this.snackbar.open('Username changed successfully', 'Close', {
            duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
          });
        } else {
          this.snackbar.open('Failed to change username', 'Close', {
            duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
          });
        }
      })
    );
  }

  changeAvatar(user: UserI): Observable<boolean> {
    return this.http.post<boolean>('api/users/changeAvatar', user).pipe();
  }

  isUsernameAvailable(newUsername: string): Observable<boolean> {
    this.socket.emit('checkUsernameAvailabile', newUsername)
    return (this.socket.fromEvent('doesUsernameExist'))
  }
}

function Pagination<T>(arg0: string) {
  throw new Error('Function not implemented.');
}

