import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'create-room',
    component: CreateRoomComponent,
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
