import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  constructor(
    private http: HttpClient,
  ) { }

  getUsers(page: number, limit: number = 9): Observable<UserI[]> {
    return this.http.get<{ items: UserI[] }>(`api/users?page=${page}&limit=${limit}`).pipe(
      map(response => response.items)
    );
  }

  getFriends(id: number) {
    return this.http.get<UserI[]>(`api/users?id=${id}`);
  }
}
