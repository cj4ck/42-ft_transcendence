import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { RoomPaginateI } from 'src/app/model/room.interface';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserI } from 'src/app/model/user.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit{

  rooms$: Observable<RoomPaginateI> = this.chatService.getMyRooms()
  selectedRoom = null
  user: UserI = this.authService.getLoggedInUser()

  constructor(private chatService: ChatService, private authService: AuthService) { }

  ngOnInit() {
    this.chatService.emitPaginateRooms(10, 0)
  }

  ngAfterViewInit(): void {
    this.chatService.emitPaginateRooms(10, 0)
  }

  onSelectRoom(event: MatSelectionListChange) {
    this.selectedRoom = event.source.selectedOptions.selected[0].value
  }

  onPaginateRooms(pageEvent: PageEvent) {
    this.chatService.emitPaginateRooms(pageEvent.pageSize, pageEvent.pageIndex)
  }
}
