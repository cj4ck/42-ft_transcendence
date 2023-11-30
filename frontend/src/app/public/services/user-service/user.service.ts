import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { UserI, UserPaginateI } from '../../../model/user.interface';
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
    return this.http.get<UserPaginateI>(`api/users/`)
  }

  findByUsername(username: string): Observable<UserI[]> {
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

  changeUsername(user: UserI): Observable<UserI> {
	return this.http.post<UserI>('api/users/change-username', user).pipe(
		tap((updatedUser: UserI) => this.snackbar.open(`Username changed to ${updatedUser.username}`, 'Close', {
			duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
		}))
	)
  }
  
  isUsernameAvailable(newUsername: string): Observable<boolean> {
	this.socket.emit('checkUsernameAvailabile', newUsername)
	return (this.socket.fromEvent('doesUsernameExist'))
  }
}

function Pagination<T>(arg0: string) {
  throw new Error('Function not implemented.');
}

