import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  constructor(
    private http: HttpClient,
  ) { }

  getUsers(): Observable<UserI[]> {
    return this.http.get<UserI[]>('api/users')
  }

  getFriends(id: number) {
    return this.http.get<UserI[]>(`api/users/find-friends?id=${id}`);
  }
}
