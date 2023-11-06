import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
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
  secret: string;

  constructor(
    private authService: AuthService,
    private router: Router,  
  ) {}

  ngOnInit() {
    this.authService.initialize2fa().subscribe((data: TwoFactorInitializationResponse) => {
      this.qrCodeUrl = data.qrCodeUrl;
    });
  }

  verifySetup() {
    this.authService.verifySetup(this.verificationCode, this.secret).subscribe(success => {
      if (success) {
        this.router.navigate(['../dashboard']);
      } else {
        this.errorMessage = "Verification failed. Please try again.";
      }
    })
  }
}

interface TwoFactorInitializationResponse {
  qrCodeUrl: string;
}
