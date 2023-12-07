import { Component, OnInit } from '@angular/core';
import { FriendRequestI } from 'src/app/model/friend-request.interface';
import { FriendProfileService } from '../../services/friend-profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  friendRequests: FriendRequestI[] = [];

  constructor(
    private friendProfileService: FriendProfileService
  ) {}

  ngOnInit(): void {
    this.friendProfileService.getFriendRequests().subscribe(
      (data) => {
        this.friendRequests = data;
      },
      (error) => {
        console.error('Error fetching friend requests', error);
      }
    );
  }
}
