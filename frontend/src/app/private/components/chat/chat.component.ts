import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable, } from 'rxjs';
import { RoomI, RoomPaginateI } from 'src/app/model/room.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserI } from '../../../model/user.interface';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit{

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
	console.log('in dashboard', this.selectedRoom)
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
