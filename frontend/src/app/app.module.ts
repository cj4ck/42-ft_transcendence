import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { JwtModule } from '@auth0/angular-jwt';
import { PendingChangesGuard } from './guards/pending-changes.guard';

export function tokenGetter() {
  return (localStorage.getItem("pentacode"));
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['localhost:3000', '127.0.0.1:3000']
      }
    })
  ],
  providers: [PendingChangesGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
