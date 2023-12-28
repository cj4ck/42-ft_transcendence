import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { CustomSocket } from '../../sockets/custom-socket';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit{

  constructor(
    private router: Router,
    private authService: AuthService,
    private socket: CustomSocket
  ) {}

  ngOnInit(): void {
    this.socket.emit("UserConnect", this.authService.getLoggedInUser().id)
  }

  logout(){
    this.authService.logout();
  }
}
