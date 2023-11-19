import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {

	constructor(private userService: UserService,
		private authService: AuthService,
		private router: Router,
		private activatedRoute: ActivatedRoute) {}

	defaultAvatarUrl = '../../../assets/defaultAvatar.png'
	user: UserI = this.authService.getLoggedInUser()

	showChangeUsernamePrompt: boolean = false
	changeUsernameForm: FormGroup = new FormGroup({
		newUsername: new FormControl(null, [Validators.required, Validators.maxLength(12)])
	})

	changeUsername() {
		if (this.changeUsernameForm.valid) {
			const newUsername: string = this.changeUsernameForm.get('newUsername').value
			if (this.userService.isUsernameAvailable(newUsername)) {
				this.user.username = newUsername
				this.userService.changeUsername(this.user)
				this.toggleChangeUsernameForm()
			} else {
				console.log('username is taken. please, choose a different username')
			}
		}
	}

	toggleChangeUsernameForm() {
		this.showChangeUsernamePrompt = !this.showChangeUsernamePrompt
	}

	get newUsername(): FormControl {
		return this.changeUsernameForm.get('newUsername') as FormControl;
	  }

	changeAvatar() {
		console.log('change avatar clicked')
	}

	logout() {
		console.log('logout clicked')
	}
}
