import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat-service/chat.service';
import { Observable, defaultIfEmpty, of } from 'rxjs';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { RoomPaginateI } from 'src/app/interfaces/room.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

	rooms$: Observable<RoomPaginateI> = this.chatService.getMyRooms()
	// .pipe(defaultIfEmpty({ items: [], meta: {} })) as Observable<RoomPaginateI>; //this ensures it's not undefined

	selectedRoom = null;
	
	constructor(private chatService: ChatService) {}
	
	ngOnInit() {
		this.chatService.emitPaginateRooms(10, 0);
		console.log(this.chatService.getMyRooms());
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
}
