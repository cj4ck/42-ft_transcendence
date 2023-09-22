import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat-service/chat.service';
import { of } from 'rxjs';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

	rooms$ = this.chatService.getMyRooms();
	selectedRoom = null;
	
	constructor(private chatService: ChatService) {}
	
	ngOnInit() {
		// this.chatService.createRoom();
		// this.chatService.getMyRooms().subscribe((data) => {
		// 	console.log(data);
		// 	this.rooms$ = of(data);
		// });
	}

	ngAfterViewInit(): void {
		this.chatService.emitPaginateRooms(10, 0);
	}

	onSelectRoom(event: MatSelectionListChange) {
		this.selectedRoom = event.source.selectedOptions.selected[0].value;
	}

	onPaginateRooms(pageEvent: PageEvent) {
		this.chatService.emitPaginateRooms(pageEvent.pageSize, pageEvent.pageIndex);
	}
	
	// TESTING
	// title = "testing";

	// islands = [
	// 	{name: 'Socotra'},
	// 	{name: 'Ibiza'},
	// 	{name: 'Lanzarote'}
	// ];
}
