import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
    twoFactorAuthCode: new FormControl(null, [Validators.pattern(/^\d{6}$/)]),
  });

  constructor(
    private authService: AuthService,
    private router : Router,
    private route: ActivatedRoute,
  ) { }

  twoFactorRequired: boolean = false;
  errorMessage: string;

  ngOnInit() {
    const jwtToken = this.route.snapshot.queryParamMap.get('token');
    if (jwtToken) {
      localStorage.setItem('nestjs_chat_app', jwtToken);
      this.router.navigate(['private']);
    }
  }

  login() {
    if (this.form.valid) {
      this.authService.login({
        email: this.email.value,
        password: this.password.value
      }).subscribe({
        next:
        (response) => {
          if (response.status === '2FA_required') {
            this.twoFactorRequired = true;
          } else {
            localStorage.setItem('nestjs_chat_app', response.access_token);
            this.router.navigate(['private']);
          }
        },
        error:
        (_error) => {
          this.errorMessage = "Incorrect email or password";
        }
    });
    }
  }

  verifyTwoFactorCode() {
    if (this.twoFactorAuthCode.valid) {
      this.authService.verifyTwoFactorToken(
        this.twoFactorAuthCode.value, this.email.value,
      ).subscribe(
        response => {
          localStorage.setItem('nestjs_chat_app', response.access_token);
          this.router.navigate(['private/navigation']);
        },
        error => {
          console.error('2FA verification error:', error);
          this.errorMessage = 'Invalid 2FA code';
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
