import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserI } from 'src/app/model/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  
  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
    twoFactorAuthCode: new FormControl(null),
  });

  constructor(
    private authService: AuthService,
    private router : Router,
    private route: ActivatedRoute,
  ) { }

  twoFactorRequired: boolean = false;

  ngOnInit() {
    const jwtToken = this.route.snapshot.queryParamMap.get('token');
    if (jwtToken) {
      localStorage.setItem('nestjs_chat_app', jwtToken);
      this.router.navigate(['../../private/components/dashboard']);
    }
  }

  login() {
    if (this.form.valid) {
      this.authService.login({
        email: this.email.value,
        password: this.password.value
      }).subscribe(
        response => {
          console.log(response.status);
          if (response.status === '2FA_required') {
            this.twoFactorRequired = true;
          } else {
            localStorage.setItem('nestjs_chat_app', response.access_token); // assuming your response includes a token
            this.router.navigate(['../../private/components/dashboard']);
          }
        },
        error => {
          console.error('Login error:', error);
        }
      );
    }
  }
  
  // New method to verify 2FA token
  verifyTwoFactorCode() {
    if (this.twoFactorAuthCode.valid) {
      this.authService.verifyTwoFactorToken(
        this.twoFactorAuthCode.value, this.email.value,
      ).subscribe(
        response => {
          localStorage.setItem('nestjs_chat_app', response.access_token);
          this.router.navigate(['../../private/components/dashboard']);
        },
        error => {
          console.error('2FA verification error:', error);
          // Handle the error, possibly resetting the 2FA input for retry
        }
      );
    }
  }

  loginWithFortyTwo() {
    window.location.href = '/api/auth/42/login';
  }
  
  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get twoFactorAuthCode(): FormControl {
    return this.form.get('twoFactorAuthCode') as FormControl;
  }
}
