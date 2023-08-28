import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserI } from 'src/app/model/user.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent {

  form: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null),
    users: new FormArray([], [Validators.required])
  })

  constructor(private chatService: ChatService, private router: Router, private activatedRoute: ActivatedRoute) {}

  create() {
    if (this.form.valid) {
      this.chatService.createRoom(this.form.getRawValue());
      this.router.navigate(['../dashboard'], {relativeTo: this.activatedRoute});
    }
  }

  initUser(user: UserI) {
    return new FormControl({
      id: user?.id,
      username: user?.username,
      email: user?.email
    });
  }

  addUser(userFormControl: FormControl) {
    this.users.push(userFormControl);
  }

  removeUser(userId: number | undefined) {
    if (userId !== undefined) {
      const index = this.users.value.findIndex((user: UserI) => user.id === userId);
      if (index !== -1) {
        this.users.removeAt(index);
      }
    }
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
