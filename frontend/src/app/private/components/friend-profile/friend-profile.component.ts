import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { map, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { FriendRequestI, FriendRequestStatus, FriendRequestStatusI } from 'src/app/model/friend-request.interface';
import { UserI } from 'src/app/model/user.interface';
import { FriendProfileService } from '../../services/friend-profile.service';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';

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
  friendRequestIdSubscription$: Subscription;
  isFriend$: Observable<boolean>;
  isFriend: boolean;

  constructor(
    private route: ActivatedRoute,
    private friendProfileService: FriendProfileService,
    private authService: AuthService,
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

    this.friendRequestIdSubscription$ = this.getUserIdFromUrl().pipe(
      switchMap((userId: number) => {
        return this.friendProfileService.getFriendRequestId(userId, this.authService.getLoggedInUser().id);
      })
    ).subscribe(
      (friendRequestId: number) => {
        this.friendRequestId = friendRequestId;
      }
    );

    this.getUserIdFromUrl().subscribe(userId => {
      this.friendProfileService.isFriend(userId).subscribe(isFriend => {
        this.isFriend = isFriend;
        console.log("Is Friend", this.isFriend);
      });
    });
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
    this.friendRequestIdSubscription$.unsubscribe();
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
        const userId = +urlSegment[1].path
        return userId
      })
    )
  }

  async responseToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ) {
    this.responseClicked = true;
    const handledFriendRequest: FriendRequestI = this.friendProfileService.friendRequests.find(
      (friendRequest) => friendRequest.id === id
    );
    const unhandledFriendRequest: FriendRequestI[] = this.friendProfileService.friendRequests.filter(
      (friendRequest) => friendRequest.id !== handledFriendRequest.id
    );

    this.friendProfileService.friendRequests = unhandledFriendRequest;

    return this.friendProfileService.respondToFriendRequest(id, statusResponse).pipe(take(1)).subscribe();
  }
}
