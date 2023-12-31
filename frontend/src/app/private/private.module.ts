import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivateRoutingModule } from './private-routing.module';
import { ChatComponent } from './components/chat/chat.component';
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
import { NavigationComponent } from './components/navigation/navigation.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { PlayersComponent } from './components/players/players.component';
import { GameComponent } from './components/game/game.component';
import { GameroomComponent } from './components/game/gameroom/gameroom.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';
import { UsersListedComponent } from './components/users-listed/users-listed.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { FriendProfileComponent } from './components/friend-profile/friend-profile.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { GamecardComponent } from './components/game-history/gamecard/gamecard.component';

@NgModule({
	declarations: [
		ChatComponent,
		CreateRoomComponent,
		SelectUsersComponent,
		ChatRoomComponent,
		ChatMessageComponent,
		NavigationComponent,
		AboutUsComponent,
		PlayersComponent,
		GameComponent,
		GameroomComponent,
		TwoFactorSetupComponent,
    UsersListedComponent,
    UserSettingsComponent,
    FriendProfileComponent,
    UserProfileComponent,
    GameHistoryComponent,
    GamecardComponent,
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
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule
  ]
})
export class PrivateModule {}
