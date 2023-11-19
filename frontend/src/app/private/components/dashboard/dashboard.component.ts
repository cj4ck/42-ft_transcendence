import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat-service/chat.service';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable, } from 'rxjs';
import { RoomI, RoomPaginateI } from 'src/app/model/room.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserI } from '../../../model/user.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit{

  rooms$: Observable<RoomPaginateI> = this.chatService.getMyRooms() //?? ask Karol about this
  selectedRoom = null
  user: UserI = this.authService.getLoggedInUser()
  @ViewChild(MatSelectionList) selectionList: MatSelectionList

  constructor(
    private chatService: ChatService, 
    private authService: AuthService,
	// private cdr: ChangeDetectorRef
    // private userService: UserService
    ) { }

  async ngOnInit() {
	this.rooms$ = this.chatService.getMyRooms() //?? ask Karol about this await stuff
    this.chatService.emitPaginateRooms(10, 0)
  }

  ngAfterViewInit(): void {
	this.rooms$.subscribe((rooms: RoomPaginateI) => {
		// console.log('rooms:', rooms);
	  });
    this.chatService.emitPaginateRooms(10, 0)
  }

  onSelectRoom(event: MatSelectionListChange) {
    this.selectedRoom = event.source.selectedOptions.selected[0].value
  }

  onPaginateRooms(pageEvent: PageEvent) {
    this.chatService.emitPaginateRooms(pageEvent.pageSize, pageEvent.pageIndex)
  }

  async updateRoom(event: Event) {
	const updatedRoom = event as unknown as RoomI
	this.selectedRoom = updatedRoom
	console.log()
	if (updatedRoom === null) {
		this.selectionList.deselectAll()
		// this.reloadCurrentPage()
		// this.rooms$ = this.chatService.getMyRooms()
	}
	// console.log('selected room is updated, room:', this.selectedRoom)
  }

  reloadCurrentPage() {
	window.location.reload()
  }

}
