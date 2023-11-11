import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, combineLatest, combineLatestAll, concatMap, exhaustMap, firstValueFrom, forkJoin, map, mergeAll, mergeMap, startWith, switchMap, tap } from 'rxjs';
import { MessageI, MessagePaginateI } from 'src/app/model/message.interface';
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
  @ViewChild('messages', {static: false}) private messagesScroller: ElementRef
	
  
	constructor(private chatService: ChatService, private authService: AuthService) { }
  
	isRoomProtected: boolean = false
	isRoomDM: boolean = false
	isRoomPrivate: boolean = false
  user: UserI = this.authService.getLoggedInUser()
  allMessagesPaginate : MessageI[] = []


  messagesPaginate$: Observable<MessagePaginateI> = combineLatest([
    this.chatService.getMessages(),
    this.chatService.getAddedMessage().pipe(startWith(null)),
    this.chatService.getBlockedUsers(this.user.id).pipe(startWith(this.user.blocked))
  ]).pipe(
    map(([messagePaginate, message, blockedUsers]) => {
      console.log('Blocked Users for id:', this.user.id, '| blocked:', blockedUsers, '| items:', messagePaginate.items)
      if (message && message.room.id === this.chatRoom.id 
        // && !blockedUsers.includes(message.user.id)
        ) {
          messagePaginate.items.push(message)
        }
        
      this.allMessagesPaginate = messagePaginate.items
      messagePaginate.items = messagePaginate.items.filter((item) => {
      if (!blockedUsers.includes(item.user.id)) {
        return (!blockedUsers.includes(item.user.id))
      }
      else {
        return this.allMessagesPaginate
      }
        
      });
      const items = messagePaginate.items.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      messagePaginate.items = items
      return messagePaginate
    })
    ,tap(() => this.scrollToBottom())
  )

  // async getBlockedUsers() {
  //   const blockedUsersPromise = new Promise<number[]>((resolve) => {
  //     const subscription = this.chatService.getBlockedUsers(this.user.id).subscribe((blcd: number[]) => {
  //     subscription.unsubscribe()
  //     resolve(blcd)
  //     })
  //   })
  //   this.blockedUsers = await blockedUsersPromise
  // }

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

  // isUserBlocked(userId: number): boolean {
  //   return this.blockedUsers.includes(userId);
  // }

  // isUserBlocked(userId: number): boolean {
  //   let bool: boolean = false
  //   bool = this.blockedUsers$.includes(userId);
  //   console.log('Is user:id: ', userId, 'Blocked?: ', bool)
  //   return bool
  // }

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
