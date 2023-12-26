import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, firstValueFrom, map, pipe, switchMap, tap, toArray } from 'rxjs';
import { UserI, UserPaginateI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';
import { RoomI, RoomPaginateI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-users-listed',
  templateUrl: './users-listed.component.html',
  styleUrls: ['./users-listed.component.css']
})
export class UsersListedComponent implements OnInit {

  // @Input() users: UserI[] = []
  // @Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>()
  // @Output() removeuser: EventEmitter<UserI> = new EventEmitter<UserI>()
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private chatService: ChatService) {}

  filteredUsers: UserI[]
  numUsers: number = 0
  users: UserI[] = []
  usersBlocked: number[] = []
  currentUser: UserI = this.authService.getLoggedInUser()
  userBlockedToggles: {[user_id: number]: boolean } = {};


  ngOnInit(): void {
    this.userService.findByID(this.currentUser.id).subscribe((user: UserI) => {
      this.usersBlocked = user.blocked
      this.userService.getAllUsers().subscribe((data) => {
        this.filteredUsers = data.items
        this.numUsers = data.meta.totalItems
        // //   console.log(this.filteredUsers)
        for (let i = 0; i < this.numUsers; i++) {
          const user = this.filteredUsers[i]
          if (user.username != this.currentUser.username) {
            this.users.push(user)
            if (this.usersBlocked.includes(user.id)) {
              this.userBlockedToggles[user.id] = true
            }
            else {
              this.userBlockedToggles[user.id] = false
            }
          }
        }
      })
    })

  }

  createPrivateChat(username: string) {
    console.log('Clicked on username: ' + username)
    this.chatService.createDmRoom(username);
  }

  toggleUserBlock(user_id: number) {
    console.log("clicked on id to block: " + user_id)
    // this.usersBlocked = this.currentUser.blocked
    let blocked: boolean = false
    for (let i = 0; i < this.usersBlocked.length; i++) {
      if (this.usersBlocked[i] === user_id) {
        blocked = true;
        // removing from blockedList
        this.usersBlocked.splice(i, 1);
        break;
      }
    }
    // flip the toggle
    this.userBlockedToggles[user_id] = !this.userBlockedToggles[user_id]
    // if not blocked, add to block list
    if (!blocked) {
      this.usersBlocked.push(user_id);
    }
    this.currentUser.blocked = this.usersBlocked
    this.chatService.toggleUserBlock(this.currentUser)
  }
}