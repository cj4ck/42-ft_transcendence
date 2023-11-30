import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router : Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const jwtToken = this.route.snapshot.queryParamMap.get('token');
    if (jwtToken) {
      localStorage.setItem('nestjs_chat_app', jwtToken);
      this.router.navigate(['../../private/components/dashboard']);
    }
  }

  login() {
    if (this.form.valid) {
      console.log('inside')
      this.authService.login({
        email: this.email.value,
        password: this.password.value
      }).pipe(
        tap(() => this.router.navigate(['../../private/components/navigation']))
      ).subscribe()
    }
  }

  loginWithFortyTwo() {
    window.location.href = 'http://127.0.0.1:3000/api/auth/42/login';
  }
  

  get email(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }
}
