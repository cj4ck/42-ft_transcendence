import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserService } from 'src/app/public/services/user-service/user.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css'],
})
export class UserSettingsComponent {

  selectedFile: File | null = null;

  userId: number = this.authService.getLoggedInUser().id;
  user: UserI = null;
  showFileInput: boolean = false;
  is2faEnabled: boolean;
  errorMessage: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private authService: AuthService,
  ) {
    const userId: number = this.authService.getLoggedInUser().id;
    this.userService.findByID(userId).subscribe(user => {
      this.user = user;
      this.is2faEnabled = user.isTwoFactorEnabled;
    });
  }

  showChangeUsernamePrompt: boolean = false;
  changeUsernameForm: FormGroup = new FormGroup({
    newUsername: new FormControl(null, [
      Validators.required,
      Validators.maxLength(12),
    ]),
  });

  changeUsername() {
    if (this.changeUsernameForm.valid) {
      const newUsername: string = this.changeUsernameForm.get('newUsername').value
      this.user.username = newUsername
      const ret = this.userService.changeUsername(this.user).subscribe()
      this.showChangeUsernamePrompt = false;
    }
  }

  toggleChangeUsernameForm() {
    this.showChangeUsernamePrompt = !this.showChangeUsernamePrompt;
  }

  get newUsername(): FormControl {
    return this.changeUsernameForm.get('newUsername') as FormControl;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  changeAvatar() {
    this.showFileInput = true;
    if (!this.selectedFile) {
      //   alert('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    this.http.post('api/users/avatar-upload', formData)
      .subscribe({
        next: (response: any) => {
          this.user.avatar = 'http://localhost:3000/' + response.filePath;
          this.userService.changeAvatar(this.user).subscribe()
          this.selectedFile = null;
          this.showFileInput = false;
        },
        error: (error) => console.error(error),
      });
  }
}