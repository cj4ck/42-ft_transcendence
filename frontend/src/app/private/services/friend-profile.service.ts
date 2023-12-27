import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FriendRequestI, FriendRequestStatusI } from 'src/app/model/friend-request.interface';
import { UserI } from 'src/app/model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class FriendProfileService {
  friendRequests: FriendRequestI[];

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private http: HttpClient,
  ) { }

  getUser(id: number): Observable<UserI> {
    return this.http.get<UserI>(`api/users/user-profile/${id}`)
  }

  getFriendRequestStatus(id: number): Observable<FriendRequestStatusI> {
    return this.http.get<FriendRequestStatusI>(`api/users/friend-request/status/${id}`)
  }

  addFriend(id: number): Observable<FriendRequestI | { error: string }> {
    return this.http.post<FriendRequestI | { error: string }>(
      `api/users/friend-request/send/${id}`,
      {},
      this.httpOptions
    );
  }

  getFriendRequests(): Observable<FriendRequestI[]> {
    return this.http.get<FriendRequestI[]>(
      'api/users/friend-request/me/received-requests'
    );
  }

  respondToFriendRequest(id: number, statusResponse: 'accepted' | 'declined'): Observable<FriendRequestI> {
    return this.http.put<FriendRequestI>(
      `api/users/friend-request/response/${id}`,
      { status: statusResponse },
      this.httpOptions
    );
  }

  getFriendRequestId(creatorId: number, receiverId: number): Observable<number> {
    return this.http.get<number>(`api/users/friend-request-id?creatorId=${creatorId}&receiverId=${receiverId}`);
  }

  isFriend(id: number): Observable<boolean> {
    return this.http.get<FriendRequestStatusI>(`api/users/friend-request/status/${id}`).pipe(
      map(friendRequestStatus => friendRequestStatus.status === 'accepted')
    );
  }
}
