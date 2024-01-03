import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';

@Component({
  selector: 'app-two-factor-verify',
  templateUrl: './two-factor-verify.component.html',
  styleUrls: ['./two-factor-verify.component.css']
})
export class TwoFactorVerifyComponent {

  verificationCode: string;
  errorMessage: string;
  isTwoFactorEnabled: boolean;
  userEmail: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.userEmail = this.route.snapshot.paramMap.get('email');
  }

  verify2fa() {
    if (this.isCodeValid()) {
      this.authService.verify42TwoFactorToken(
        this.verificationCode,
        this.userEmail
      ).subscribe(
        response => {
          localStorage.setItem('pentacode', response.access_token);
          this.router.navigate(['private']);
        },
        error => {
          this.errorMessage = "Verification failed. Please try again.";
        }
      );
    }
  }

  isCodeValid(): boolean {
    return /^\d{6}$/.test(this.verificationCode);
  }
}
