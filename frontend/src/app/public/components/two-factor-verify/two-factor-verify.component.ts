import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
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

  ngOnInit() {
    this.authService.isTwoFactorEnabled().subscribe((response: { isEnabled: boolean }) => {
      this.isTwoFactorEnabled = response.isEnabled;
      if (!this.isTwoFactorEnabled) {
        this.router.navigate(['/private/2fa-setup']);
      }
    })
  }

  verify2fa() {
    if (this.verificationCode) {
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
}
