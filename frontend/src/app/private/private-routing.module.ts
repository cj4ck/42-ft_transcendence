import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';
import { TwoFactorVerifyComponent } from './components/two-factor-verify/two-factor-verify.component';

const routes: Routes = [

  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'create-room',
    component: CreateRoomComponent
  },
  {
    path: '2fa-setup',
    component: TwoFactorSetupComponent
  },
  {
    path: '2fa-verify',
    component: TwoFactorVerifyComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateRoutingModule { }
