import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { UserI } from 'src/app/model/user.interface';
import { UserService } from 'src/app/public/services/user-services/user.service';

@Component({
  selector: 'app-select-users',
  templateUrl: './select-users.component.html',
  styleUrls: ['./select-users.component.css']
})
export class SelectUsersComponent implements OnInit {

	@Input() users: UserI[] = [];
	@Output() addUser: EventEmitter<UserI> = new EventEmitter<UserI>();
	@Output() removeuser: EventEmitter<UserI> = new EventEmitter<UserI>();

	searchUsername = new FormControl();
	filteredUsers: UserI[] = [];
	selectedUser: UserI = null;

	constructor(private userService: UserService) {}

	ngOnInit(): void {
		console.log('init');
		// console.log(this.searchUsername);
		this.searchUsername.valueChanges.pipe(
			debounceTime(500),
			distinctUntilChanged(),
			switchMap((username: string) => this.userService.findByUsername(username).pipe(
				tap((users: UserI[]) => this.filteredUsers = users)
			))
		).subscribe();
		console.log('filteredUsers: ', this.filteredUsers);
	}

	addUserToForm() {
		this.addUser.emit(this.selectedUser);
		console.log(this.selectedUser);
		this.filteredUsers = [];
		this.selectedUser = null;
		this.searchUsername.setValue(null);
	}

	removeUserFromForm(user: UserI) {
		this.removeuser.emit(user);
	}

	setSelectedUser (user: UserI) {
		console.log(this.selectedUser);
		this.selectedUser = user;
	}

	displayFn(user: UserI) {
		console.log('displayFn')
		if(user) {
			console.log(user.username);
			return user.username;
		} else {
			return '';
		}
	}
}
