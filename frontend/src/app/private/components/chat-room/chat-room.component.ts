import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, combineLatest, firstValueFrom, map, startWith, tap } from 'rxjs';
import { MessagePaginateI } from 'src/app/model/message.interface';
import { RoomI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/public/_helpers/custom-validators';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserI } from 'src/app/model/user.interface';

@Component({
	selector: 'app-chat-room',
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.scss']
})

export class ChatRoomComponent implements OnChanges, OnDestroy, AfterViewInit {

  @Input() chatRoom: RoomI
  chatRoomUsers: UserI[]
  chatRoomFullInfo: RoomI
  user: UserI = this.authService.getLoggedInUser()
  isOwner: boolean = false
  @ViewChild('messages', {static: false}) private messagesScroller: ElementRef

	constructor(private chatService: ChatService, private authService: AuthService) { }

	isRoomProtected: boolean = false
	isRoomDM: boolean = false
	isRoomPrivate: boolean = false
  filteredMessagesPaginate : MessagePaginateI
  lastCreatedMessage: number

  messagesPaginate$: Observable<MessagePaginateI> = combineLatest([
    this.chatService.getMessages(),
    this.chatService.getAddedMessage().pipe(startWith(null)),
    this.chatService.getBlockedUsers(this.user.id).pipe(startWith(this.user.blocked))
  ]).pipe(
    map(([messagePaginate, message, blockedUsers]) => {
      this.filteredMessagesPaginate = {items: [],meta: null};
      this.lastCreatedMessage = this.lastCreatedMessage || null
      if (message && 
          message.room.id === this.chatRoom.id && 
          this.lastCreatedMessage != new Date(message.created_at).getTime()
      ) {
        messagePaginate.items.push(message);
        this.lastCreatedMessage = new Date(message.created_at).getTime()
      }
      const items = messagePaginate.items.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      messagePaginate.items = items;
      this.filteredMessagesPaginate.items = messagePaginate.items.filter((item) => {
        return !blockedUsers.includes(item.user.id);
      });
      // console.log('After filter on messagePaginate: ', this.filteredMessagesPaginate)
      // console.log('Blocked Users for id:', this.user.id, '| blocked:', blockedUsers, '| items:', messagePaginate.items);
      return this.filteredMessagesPaginate; // Return the modified messagePaginate
    }),
    tap(() => this.scrollToBottom())
  );

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
  //old prob not useful
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


  async ngOnChanges(changes: SimpleChanges) {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue)
    if(this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom)
	  this.isRoomDM = this.chatRoom.type === 'dm'
	  this.isRoomProtected = this.chatRoom.type === 'protected'
	  this.isRoomPrivate = this.chatRoom.type === 'private'
	  this.chatRoomFullInfo = await firstValueFrom(this.chatService.getChatRoomInfo(this.chatRoom.id))
	  this.chatRoomUsers = this.chatRoomFullInfo.users
	  this.user.id === this.chatRoomFullInfo.owner_id ? this.isOwner = true : false
		// console.log('owner ', this.chatRoomFullInfo.owner_id)
		// console.log('users ', this.chatRoomFullInfo.users)
    }
		console.log('outside?')
  }

  ngAfterViewInit() {
	if (this.chatRoom) {
		console.log('afterviewinit:', this.chatRoom.users)
	}
    // this.scrollToBottom()
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
    // setTimeout(() => {this.messagesScroller.nativeElement.scrollTop = this.messagesScroller.nativeElement.scrollHeight}, 1)
  }

}
