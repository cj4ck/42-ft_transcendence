import { Component, OnInit } from '@angular/core';
import { UserI } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { PlayersService } from '../../services/players.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  users: UserI[] = [];
  paginatedUsers: UserI[] = [];
  friends: UserI[] = [];
  currentPage: number = 1;
  usersPerPage = 9;
  loadFriendsMode: boolean = false;

  constructor(
    private playersService: PlayersService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.loadFriendsMode) {
      this.loadFriends();
    } else {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.playersService.getUsers().subscribe((data: UserI[]) => {
      this.users = data.sort((a, b) => b.score - a.score);
      this.paginateUsers()
    });
  }

  loadFriends() {
    this.playersService.getFriends(this.authService.getLoggedInUser().id).subscribe((data: UserI[]) => {
      this.users = data.sort((a, b) => b.score - a.score);
      this.paginateUsers()
    })
  }

  paginateUsers() {
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    const endIndex = this.currentPage * this.usersPerPage;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  isNextPageAvailable(): boolean {
    return this.currentPage * this.usersPerPage < this.users.length;
  }

  isPreviousPageAvailable(): boolean {
    return this.currentPage > 1;
  }

  goToNextPage() {
    this.currentPage++;
    this.loadUsers();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  onToggleSwitchChange() {
    this.currentPage = 1;
    this.loadData();
  }
}
