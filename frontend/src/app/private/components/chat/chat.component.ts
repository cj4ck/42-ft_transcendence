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
export class ChatComponent implements AfterViewInit {

  rooms$: Observable<RoomPaginateI>
  filteredRooms: RoomI[]
  selectedRoom = null
  user: UserI = this.authService.getLoggedInUser()
  @ViewChild(MatSelectionList) selectionList: MatSelectionList

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.rooms$ = this.chatService.getMyRooms()
    this.chatService.emitPaginateRooms(15, 0)
  }

  ngAfterViewInit(): void {
    this.rooms$.subscribe((rooms: RoomPaginateI) => {
      this.filteredRooms = rooms.items.filter(room =>
        !(room.type == 'private' &&
          (!room.users.some(user => user.username == this.user.username)
            && room.owner_id != this.user.id))
      );
    });
    this.chatService.emitPaginateRooms(15, 0)
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
    if (updatedRoom === null) {
      this.selectionList.deselectAll()
    }
  }

  reloadCurrentPage() {
    window.location.reload()
  }

}
