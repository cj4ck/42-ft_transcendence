import { Component, OnInit } from '@angular/core';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-users-listed',
  templateUrl: './users-listed.component.html',
  styleUrls: ['./users-listed.component.css']
})
export class UsersListedComponent implements OnInit {

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
        for (let i = 0; i < data.length; i++) {
          const user = data[i]
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
    let blocked: boolean = false

    for (let i = 0; i < this.usersBlocked.length; i++) {
      if (this.usersBlocked[i] === user_id) {
        blocked = true;
        this.usersBlocked.splice(i, 1);
        break;
      }
    }

    this.userBlockedToggles[user_id] = !this.userBlockedToggles[user_id]

    if (!blocked) {
      this.usersBlocked.push(user_id);
    }

    this.currentUser.blocked = this.usersBlocked
    this.chatService.toggleUserBlock(this.currentUser)
  }
}
