import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.css']
})
export class SelectUsersComponent implements OnInit {

  @Input() users: UserI[] = []
  @Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>()
  @Output() removeuser: EventEmitter<UserI> = new EventEmitter<UserI>()

  searchUsername = new FormControl()
  filteredUsers: UserI[] = [];
  selectedUser: UserI = null;
  currentUserId: number;

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.searchUsername.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((username: string) => this.userService.findByUsername(username).pipe(
        tap((users: UserI[]) => {
          this.filteredUsers = users.filter(user =>
            user.id !== this.currentUserId &&
            !this.users.some(addedUser => addedUser.id === user.id)
          );
        })
      ))
    ).subscribe()
  }

  addUserToForm() {
    if(this.selectedUser)
    this.addUser.emit(this.selectedUser)
    this.filteredUsers = []
    this.selectedUser = null
    this.searchUsername.setValue(null)
  }

  removeUserFromForm(user: UserI) {
    this.removeuser.emit(user)
  }

  setSelectedUser(user: UserI) {
    this.selectedUser = user
  }

  displayFn(user: UserI) {
    if(user) {
      return user.username
    } else {
      return ''
    }
  }
}
