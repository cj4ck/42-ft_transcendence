import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, combineLatest, map, startWith, tap } from 'rxjs';
import { MessagePaginateI } from 'src/app/model/message.interface';
import { RoomI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/public/_helpers/custom-validators';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnChanges, OnDestroy, AfterViewInit {

  @Input() chatRoom: RoomI
  // @ViewChild('messages', {static: true}) private messagesScroller: ElementRef

  messagesPaginate$: Observable<MessagePaginateI> = combineLatest([this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))]).pipe(
    map(([messagePaginate, message]) => {
      if (message && message.room.id === this.chatRoom.id) {
        messagePaginate.items.push(message)
      }
      const items = messagePaginate.items.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      messagePaginate.items = items
      console.log('items',items)
      return messagePaginate
    })
    // , 
    // tap(() => this.scrollToBottom())
  )

  //adding password to chat
//   showPasswordForm = false
//   passwordForm: FormGroup = new FormGroup({
// 	password: new FormControl(null, [Validators.required]),
// 	passwordConfirm: new FormControl(null, [Validators.required])
//   },
//   {
// 	validators: CustomValidators.passwordsMatching
//   })

//   setChatPassword() {
// 	if (this.passwordForm.valid) {
// 		// this.chatRoom.password = this.passwordForm.getRawValue()
// 		// this.chatService.setChatPassword()
// 		console.log('Password is set')
		
// 	}
//   }

//   get password(): FormControl {
//     return this.passwordForm.get('password') as FormControl;
//   }

//   get passwordConfirm(): FormControl {
//     return this.passwordForm.get('passwordConfirm') as FormControl;
//   }

//   togglePasswordForm() {
// 	this.showPasswordForm = !this.showPasswordForm
//   }

  //end of password stuffs

  chatMessage: FormControl = new FormControl(null, [Validators.required])

  constructor(private chatService: ChatService) { }

  ngOnChanges(changes: SimpleChanges) {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue)
    if(this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom)
    }
  }

  ngAfterViewInit() {
    // this.scrollToBottom()
  }

  ngOnDestroy() {
    this.chatService.leaveRoom(this.chatRoom)
  }

  sendMessage() {
    this.chatService.sendMessage({text: this.chatMessage.value, room: this.chatRoom})
    this.chatMessage.reset()
  }

  scrollToBottom(): void {
    // setTimeout(() => {this.messagesScroller.nativeElement.scrollTop = this.messagesScroller.nativeElement.scrollHeight}, 1)
  }

}
