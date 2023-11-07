import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, combineLatest, map, startWith, tap } from 'rxjs';
import { MessagePaginateI } from 'src/app/model/message.interface';
import { RoomI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/public/_helpers/custom-validators';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';

@Component({
	selector: 'app-chat-room',
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnChanges, OnDestroy, AfterViewInit {

  @Input() chatRoom: RoomI
  @ViewChild('messages', {static: false}) private messagesScroller: ElementRef
	
	isRoomProtected: boolean = false
	isRoomDM: boolean = false
	isRoomPrivate: boolean = false
	
	constructor(private chatService: ChatService, private authService: AuthService) { }

  messagesPaginate$: Observable<MessagePaginateI> = combineLatest([
    this.chatService.getMessages(), 
    this.chatService.getAddedMessage().pipe(startWith(null))
  ]).pipe(
    tap(([messagePaginate, message]) => {
    //   console.log('Received messagePaginate:', messagePaginate);
    //   console.log('Received message:', message)
    }),
    map(([messagePaginate, message]) => {
      if (message && message.room.id === this.chatRoom.id) {
        messagePaginate.items.push(message)
      }
      const items = messagePaginate.items.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      messagePaginate.items = items
      console.log('items',items)
      return messagePaginate
    }),
    tap(() => this.scrollToBottom())
  )

  //adding password to chat
  showPasswordForm = false
  passwordForm: FormGroup = new FormGroup({
	password: new FormControl(null, [Validators.required]),
	passwordConfirm: new FormControl(null, [Validators.required])
  },
  {
	validators: CustomValidators.passwordsMatching
  })

  setChatPassword() {
	if (this.passwordForm.valid) {
		const newPassword: string = this.passwordForm.get('password').value
		this.chatRoom.password = newPassword
		this.chatService.setChatPasswordService(this.chatRoom)
		console.log('Password is set')
		this.togglePasswordForm()
		this.chatService.passwordAdded().subscribe((room: RoomI) => {
			const password = room.password;
			// console.log('Received password:', password, 'room type: ', room.type);
		})
	}
  }

  get password(): FormControl {
    return this.passwordForm.get('password') as FormControl;
  }

  get passwordConfirm(): FormControl {
    return this.passwordForm.get('passwordConfirm') as FormControl;
  }

  togglePasswordForm() {
	this.showPasswordForm = !this.showPasswordForm
  }

  //check password
  passwordValidated: boolean = false
  passwordPrompt: FormGroup = new FormGroup({
	passwordValidation: new FormControl(null, [Validators.required])
  })

  get passwordValidation(): FormControl {
    return this.passwordPrompt.get('password') as FormControl;
  }

  async checkPassword() {
	if (this.passwordPrompt.valid) {
		const passwordEntered: string = this.passwordPrompt.get('passwordValidation').value
		console.log('given password is:', passwordEntered)
		this.authService.loginChatroom(this.chatRoom, passwordEntered).pipe(
			tap(() => this.passwordValidated = true)
		).subscribe()
	}
  }
  //this will call the function that emits event to backend 
  //and the function that catches return event from backend
  //both fns defined in chat.service file
async checkSetPassword() {
	this.chatService.checkPasswordService(this.chatRoom) //to emit event
	const activePasswordPromise = new Promise<string>((resolve) => {
	  const subscription = this.chatService.getActiveChatPassword().subscribe((pswd: string) => {
		subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
		resolve(pswd);
	  });
	});

	const activePassword = await activePasswordPromise;

	console.log('checked Password but outside: ', activePassword)
  }

  //end of password stuffs

  chatMessage: FormControl = new FormControl(null, [Validators.required])


  ngOnChanges(changes: SimpleChanges) {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue)
    if(this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom)
	  this.isRoomDM = this.chatRoom.type === 'dm'
	  this.isRoomProtected = this.chatRoom.type === 'protected'
	  this.isRoomPrivate = this.chatRoom.type === 'private'
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom()
  }

  ngOnDestroy() {
    this.chatService.leaveRoom(this.chatRoom)
  }

  sendMessage() {
    if (this.chatMessage.value && this.chatMessage.valid) {
      this.chatService.sendMessage({text: this.chatMessage.value, room: this.chatRoom})
      this.chatMessage.reset()
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {this.messagesScroller.nativeElement.scrollTop = this.messagesScroller.nativeElement.scrollHeight}, 1)
  }

}
