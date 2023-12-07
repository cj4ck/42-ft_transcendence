import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { map, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { FriendRequestI, FriendRequestStatus, FriendRequestStatusI } from 'src/app/model/friend-request.interface';
import { UserI } from 'src/app/model/user.interface';
import { FriendProfileService } from '../../services/friend-profile.service';

@Component({
  selector: 'app-friend-profile',
  templateUrl: './friend-profile.component.html',
  styleUrls: ['./friend-profile.component.css']
})
export class FriendProfileComponent implements OnInit, OnDestroy {

  user: UserI;
  friendRequestStatus: FriendRequestStatus;
  friendRequestStatusSubscription$: Subscription;
  userSubscription$: Subscription;
  friendRequestsSubscription$: Subscription;
  friendRequestId: number; 
  responseClicked = false;

  constructor(
    private route: ActivatedRoute,
    private friendProfileService: FriendProfileService,
  ) { }

  ngOnInit() {
    this.friendRequestStatusSubscription$ = this.getFriendRequestStatus().pipe(
      tap((friendRequestStatus: FriendRequestStatusI) => {
        this.friendRequestStatus = friendRequestStatus.status;
        this.userSubscription$ = this.getUser().subscribe((user: UserI) => {
          this.user = user;
        })
      })
    ).subscribe();

    this.friendRequestsSubscription$ = this.friendProfileService.getFriendRequests().subscribe(
      (friendRequests: FriendRequestI[]) => {
        this.friendProfileService.friendRequests = friendRequests.filter((friendRequest: FriendRequestI) => {
          friendRequest.status === 'pending';
        })
      }
    );
  }

  getUser(): Observable<UserI> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.friendProfileService.getUser(userId);
      })
    )
  }

  ngOnDestroy(): void {
    this.userSubscription$.unsubscribe();
    this.friendRequestStatusSubscription$.unsubscribe();
    this.friendRequestsSubscription$.unsubscribe();
  }

  addUser(): Subscription {
    this.friendRequestStatus = 'pending';
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.friendProfileService.addFriend(userId);
      })
    ).pipe(take(1)).subscribe();
  }

  getFriendRequestStatus(): Observable<FriendRequestStatusI> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.friendProfileService.getFriendRequestStatus(userId);
      })
    )
  }

  private getUserIdFromUrl(): Observable<number> {
    return this.route.url.pipe(
      map((urlSegment: UrlSegment[]) => {
        return +urlSegment[0].path
      })
    )
  }

  async responseToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ){
    this.responseClicked = false;
    const handledFriendRequest: FriendRequestI = this.friendProfileService.friendRequests.find(
      (friendRequest) => friendRequest.id === id
    );
    console.log(handledFriendRequest);
    const unhandledFriendRequest: FriendRequestI[] = this.friendProfileService.friendRequests.filter(
      (friendRequest) => friendRequest.id !== handledFriendRequest.id
    );

    this.friendProfileService.friendRequests = unhandledFriendRequest;

    return this.friendProfileService.respondToFriendRequest(id, statusResponse).pipe(take(1)).subscribe();
  }
}
