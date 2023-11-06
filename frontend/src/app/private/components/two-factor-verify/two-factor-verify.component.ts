import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';

@Component({
  selector: 'app-two-factor-verify',
  templateUrl: './two-factor-verify.component.html',
  styleUrls: ['./two-factor-verify.component.css']
})
export class TwoFactorVerifyComponent {
  verificationCode: string;
  errorMessage: string;
  secret: string;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  verifyCode() {
    console.log("Verify");
    this.authService.verifyCode(this.verificationCode, this.secret).subscribe(success => {
      if (success) {
        console.log("Success");
        this.router.navigate(['../dashboard']);
      } else {
        console.log("Verification failed.");
        console.log(this.verificationCode);
        this.router.navigate(['.']);
      }
    })
  }
}
