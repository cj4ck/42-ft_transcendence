import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat-service/chat.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

	rooms$ = this.chatService.getMyRooms();
	
	constructor(private chatService: ChatService) {}
	
	ngOnInit() {
		this.chatService.createRoom();
		this.chatService.getMyRooms().subscribe((data) => {
			console.log(data);
			this.rooms$ = of(data);
		});
	}
	
	// TESTING
	title = "testing";

	islands = [
		{name: 'Socotra'},
		{name: 'Ibiza'},
		{name: 'Lanzarote'}
	];
}
