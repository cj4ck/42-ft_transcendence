import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css'],
})
export class UserSettingsComponent {
	defaultAvatarUrl = '../../../assets/defaultAvatar.png';
	userId: number = this.authService.getLoggedInUser().id
	user: UserI = null

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
	const userId: number = this.authService.getLoggedInUser().id;
	this.userService.findByID(userId).subscribe(user => {
	  this.user = user;
	});
  }

  showChangeUsernamePrompt: boolean = false;
  changeUsernameForm: FormGroup = new FormGroup({
    newUsername: new FormControl(null, [
      Validators.required,
      Validators.maxLength(12),
    ]),
  });

  changeUsername() {
	if (this.changeUsernameForm.valid)
	{
		const newUsername: string = this.changeUsernameForm.get('newUsername').value
		this.user.username = newUsername
		console.log('username:', this.user.username)
		const ret = this.userService.changeUsername(this.user).subscribe()
		console.log('changed: ', ret)
	}
  }

  toggleChangeUsernameForm() {
    this.showChangeUsernamePrompt = !this.showChangeUsernamePrompt;
  }

  get newUsername(): FormControl {
    return this.changeUsernameForm.get('newUsername') as FormControl;
  }

  changeAvatar() {
    console.log('change avatar clicked');
  }

  logout() {
    console.log('logout clicked');
  }
}
