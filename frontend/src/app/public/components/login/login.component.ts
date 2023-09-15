import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
	ngOnInit(): void {}

	form: FormGroup = new FormGroup({
		email: new FormControl(null, [Validators.required, Validators.email]),
		password: new FormControl(null, [Validators.required])
	});

	constructor(private authService: AuthService, private router: Router){}

	login() {
		if (this.form.valid) {
			console.log('inside')
			this.authService.login({
				email: this.email.value,
				password: this.password.value
			}).pipe(
				tap(() => this.router.navigate(['../../private/dashboard']))
			).subscribe()
		}
	}

	get email(): FormControl {
		return this.form.get('email') as FormControl;
	}

	get password(): FormControl {
		return this.form.get('password') as FormControl;
	}
}
