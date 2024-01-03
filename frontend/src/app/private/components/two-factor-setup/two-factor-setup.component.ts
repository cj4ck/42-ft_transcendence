import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';

@Component({
  selector: 'app-two-factor-setup',
  templateUrl: './two-factor-setup.component.html',
  styleUrls: ['./two-factor-setup.component.css']
})
export class TwoFactorSetupComponent {
  qrCodeUrl: string;
  verificationCode: string;
  errorMessage: string;
  isTwoFactorEnabled: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.authService.isTwoFactorEnabled().subscribe((response: { isEnabled: boolean }) => {
      this.isTwoFactorEnabled = response.isEnabled;
      if (!this.isTwoFactorEnabled){
        this.authService.initialize2fa().subscribe((data: TwoFactorInitializationResponse) => {
          this.qrCodeUrl = data.qrCodeUrl;
        });
      }
    })
  }

  verifySetup() {
    if (this.isTwoFactorEnabled) {
      if (this.isCodeValid) {
        this.authService.disableTwoFactorToken(this.verificationCode).subscribe(success => {
          if (success) {
            this.router.navigate(['private']);
            this.snackbar.open('2FA disabled successfully', 'Close')
          } else {
            this.errorMessage = "Verification failed. Please try again.";
          }
        })
      }
    }
    if (this.isCodeValid()) {
      this.authService.verifySetup(this.verificationCode).subscribe(success => {
        if (success) {
          this.router.navigate(['private']);
          this.snackbar.open('2FA enabled successfully', 'Close')
        } else {
          this.errorMessage = "Verification failed. Please try again.";
        }
      })
    }
  }

  isCodeValid(): boolean {
    return /^\d{6}$/.test(this.verificationCode);
  }
}

interface TwoFactorInitializationResponse {
  qrCodeUrl: string;
}
