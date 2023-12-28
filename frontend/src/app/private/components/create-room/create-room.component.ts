import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UserI } from 'src/app/model/user.interface';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-create-room',
	templateUrl: './create-room.component.html',
	styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent {

	uniqueUserValidator(): ValidatorFn {
		return (formArray: FormArray) => {
			const userIDs = formArray.controls.map(control => control.value.id);
			const uniqueUserIDs = Array.from(new Set(userIDs));
			return uniqueUserIDs.length === userIDs.length ? null : { duplicateUser: true };
		};
	}

	form: FormGroup = new FormGroup({
		name: new FormControl(null, [Validators.required]),
		description: new FormControl(null),
		users: new FormArray([], [Validators.required, this.uniqueUserValidator()]),
		type: new FormControl(null, [Validators.required])
	})

	constructor(private chatService: ChatService, private router: Router, private activatedRoute: ActivatedRoute) { }

	create() {
		if (this.form.valid) {
		this.chatService.createRoom(this.form.getRawValue())
			// console.log(this.form.getRawValue())
		this.router.navigate(['../chat'], {relativeTo: this.activatedRoute})
		}
	}

	initUser(user: UserI) {
		// console.log('init_user')
		return new FormControl({
		id: user.id,
		username: user.username,
		email: user.email
		})
	}


	addUser(userFormControl: FormControl) {
		this.users.push(userFormControl)
	}

	removeUser(userId: number) {
		this.users.removeAt(this.users.value.findIndex((user:UserI) => user.id === userId))
	}

	get name(): FormControl {
		return this.form.get('name') as FormControl
	}

	get description(): FormControl {
		return this.form.get('description') as FormControl
	}

	get users(): FormArray {
		// console.log('get_users')
		return this.form.get('users') as FormArray
	}

	get type(): FormControl {
	return this.form.get('type') as FormControl
	}
}

function uniqueUserValidator(): import("@angular/forms").ValidatorFn {
	throw new Error('Function not implemented.');
}

