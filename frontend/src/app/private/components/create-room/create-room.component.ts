import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserI } from 'src/app/model/user.interface';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent implements OnInit {

  form: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null),
    users: new FormArray([], [Validators.required])
  })

  constructor() {}

  ngOnInit(): void {
  }

  create() {

  }

  initUser(user: UserI) {
    return new FormControl({
      id: user.id,
      username: user.username,
      email: user.email
    });
  }

  addUser(userFormControl: FormControl) {
    this.users.push(userFormControl);
  }

  removeUser(userId: number) {
    
  }

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get users(): FormArray {
    return this.form.get('users') as FormArray;
  }

}
