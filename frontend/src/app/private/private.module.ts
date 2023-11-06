import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivateRoutingModule } from './private-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { SelectUsersComponent } from './components/select-users/select-users.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { TwoFactorVerifyComponent } from './components/two-factor-verify/two-factor-verify.component';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateRoomComponent,
    SelectUsersComponent,
    ChatRoomComponent,
    ChatMessageComponent,
    TwoFactorVerifyComponent,
    TwoFactorSetupComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrivateRoutingModule,
    MatListModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule
  ]
})
export class PrivateModule { }
