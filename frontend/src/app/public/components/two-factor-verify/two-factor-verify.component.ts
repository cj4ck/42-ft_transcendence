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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  verify2fa() {
    if (this.isCodeValid()) {
      this.authService.verify42TwoFactorToken(
        this.verificationCode,
      ).subscribe(
        response => {
          localStorage.setItem('nestjs_chat_app', response.access_token);
          this.router.navigate(['private/components/dashboard']);
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
