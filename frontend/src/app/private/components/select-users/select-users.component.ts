import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.css']
})
export class SelectUsersComponent implements OnInit{

  @Input() users: UserI[] = [];
  @Output() adduser: EventEmitter<UserI> = new EventEmitter<UserI>();
  @Output() removeuser: EventEmitter<UserI> = new EventEmitter<UserI>();

  searchUsername = new FormControl();
  filteredUsers: UserI[] = [];
  selectedUser: UserI | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.searchUsername.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((username: string) => this.userService.findByUsername(username).pipe(
        tap((users: UserI[]) => this.filteredUsers = users)
      ))
    ).subscribe();
  }

  setSelectedUser(user: UserI) {
    this.selectedUser = user;
  }

  addUserToForm() {
    if (this.selectedUser !== null)
      this.adduser.emit(this.selectedUser);
    this.filteredUsers = [];
    this.selectedUser = null;
    this.searchUsername.setValue(null);
  }

  removeUserFromForm(user: UserI) {
    this.removeuser.emit(user);
  }

  displayFn(user: UserI) {
    return user?.username || '';
  }
}
