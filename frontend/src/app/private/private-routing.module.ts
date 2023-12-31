import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { PlayersComponent } from './components/players/players.component';
import { GameComponent } from './components/game/game.component';
import { GameroomComponent } from './components/game/gameroom/gameroom.component';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { FriendProfileComponent } from './components/friend-profile/friend-profile.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { PendingChangesGuard } from '../guards/pending-changes.guard';

const routes: Routes = [
  {
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'aboutus',
    component: AboutUsComponent
  },
  {
    path: 'navigation',
    component: NavigationComponent
  },
  {
    path: 'players',
    component: PlayersComponent
  },
  {
    path: 'game',
    component: GameComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: 'gameroom/:id',
    component: GameroomComponent,
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: 'history/:id',
    component: GameHistoryComponent
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
  },
  {
    path: 'user-settings',
    component: UserSettingsComponent,
  },
  {
    path: '2fa-setup',
    component: TwoFactorSetupComponent
  },
  {
    path: 'user-profile',
    component: UserProfileComponent
  },
  {
    path: 'user-profile/:id',
    component: FriendProfileComponent
  },
  {
    path: '**',
    redirectTo: 'navigation',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
