import { Component, OnInit } from '@angular/core';
import { UserI } from 'src/app/model/user.interface';
import { PlayersService } from '../../services/players.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  users: UserI[] = [];
  friends: UserI[] = [];
  currentPage: number = 1;

  constructor(private playersService: PlayersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.playersService.getUsers(this.currentPage).subscribe((data: UserI[]) => {
      this.users = data.sort((a, b) => b.score - a.score); // Sorting users by score in descending order
    });
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
}
