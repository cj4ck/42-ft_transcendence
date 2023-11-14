import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, combineLatest, firstValueFrom, map, startWith, tap } from 'rxjs';
import { MessagePaginateI } from 'src/app/model/message.interface';
import { RoomI } from 'src/app/model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/public/_helpers/custom-validators';
import { AuthService } from 'src/app/public/services/auth-service/auth.service';
import { UserI } from 'src/app/model/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-chat-room',
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.scss']
})

export class ChatRoomComponent implements OnChanges, OnDestroy, AfterViewInit {

  @Input() chatRoom: RoomI
  @Output() chatRoomUpdate = new EventEmitter(); //the idea is to send a notif. to parent comp. that room is updated (but still selected)
  //and I hope that it triggers the refresh - like send 'chatRoom' value again to this comp.
  chatRoomUsers: UserI[]
  roomAdmins: number[] = []
  userAdminToggles: { [user_id: number]: boolean } = {};
  userMuteToggles: { [user_id: number]: Date } = {};
  user: UserI = this.authService.getLoggedInUser()
  isOwner: boolean = false


  @ViewChild('messages', {static: false}) private messagesScroller: ElementRef

	constructor(private chatService: ChatService, 
		private authService: AuthService,
		private snackbar: MatSnackBar) { }

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

  async updateCurrentChatroom(updatedRoom: RoomI) {
    // console.log('room in updateCurrentChatroom TEST:', updatedRoom)
    this.chatRoomUpdate.emit(updatedRoom)
  }

  //adding password to chat
  showSetPasswordForm = false
  setPasswordForm: FormGroup = new FormGroup({
	password: new FormControl(null, [Validators.required]),
	passwordConfirm: new FormControl(null, [Validators.required])
  },
  {
	validators: CustomValidators.passwordsMatching
  })

  toggleSetPasswordForm() {
	this.showSetPasswordForm = !this.showSetPasswordForm
  }

  async setChatPassword() {
	if (this.setPasswordForm.valid) {
		const newPassword: string = this.setPasswordForm.get('password').value
		this.chatRoom.password = newPassword
		this.chatService.setChatPassword(this.chatRoom)
		// console.log('Password is set')
		this.toggleSetPasswordForm()
		this.chatService.returnUpdatedRoom().pipe(
			map((room: RoomI) => {
				// console.log('updated room here hehe', room)
				this.updateCurrentChatroom(room)
			})
		).subscribe()
	}
  }

  get password(): FormControl {
    return this.setPasswordForm.get('password') as FormControl;
  }

  get passwordConfirm(): FormControl {
    return this.setPasswordForm.get('passwordConfirm') as FormControl;
  }

  //validating password
  passwordValidated: boolean = false
  passwordPrompt: FormGroup = new FormGroup({
	passwordValidation: new FormControl(null, [Validators.required])
  })

  get passwordValidation(): FormControl {
    return this.passwordPrompt.get('password') as FormControl;
  }

  async checkChatPassword() {
	if (this.passwordPrompt.valid) {
		const passwordEntered: string = this.passwordPrompt.get('passwordValidation').value
		// console.log('given password is:', passwordEntered)
		const jwtReturn = this.authService.loginChatroom(this.chatRoom, passwordEntered).pipe(
			tap(() => this.passwordValidated = true)
		).subscribe()
		// console.log('hello I am here ', this.passwordValidated)
	}
	// console.log('pswd val', this.passwordValidated)
  }

  //changing password
  showChangePasswordForm = false
  changePasswordForm: FormGroup = new FormGroup({
	newPassword: new FormControl(null, [Validators.required]),
	newPasswordConfirm: new FormControl(null, [Validators.required])
  },
  {
	validators: CustomValidators.passwordsMatching
  })

  toggleChangePasswordForm() {
	this.showChangePasswordForm = !this.showChangePasswordForm
  }
  changeChatPassword() {
	if (this.changePasswordForm.valid) {
		const newPassword: string = this.changePasswordForm.get('newPassword').value
		this.chatRoom.password = newPassword
		this.chatService.setChatPassword(this.chatRoom)
		// console.log('Password is changed')
		this.toggleChangePasswordForm()
		this.chatService.returnUpdatedRoom().pipe(
			map((room: RoomI) => {
				// console.log('updated room here hehe', room)
				this.updateCurrentChatroom(room)
			})
		).subscribe()
	}
  }

  get newPassword(): FormControl {
    return this.setPasswordForm.get('password') as FormControl;
  }

  get newPasswordConfirm(): FormControl {
    return this.setPasswordForm.get('passwordConfirm') as FormControl;
  }

  //removing password
  async removeChatPassword() {
	await this.chatService.removeChatPassword(this.chatRoom.id)
	this.chatService.returnUpdatedRoom().pipe(
		map((room: RoomI) => {
			// console.log('updated room here hehe', room)
			this.updateCurrentChatroom(room)
		})
	).subscribe()
  }

  //end of password stuffs

  leaveChat() {
	this.chatService.leaveChat(this.user.id, this.chatRoom.id)
	this.chatService.returnUpdatedRoom().pipe(
		map((room: RoomI) => {
			console.log('updated room here hehe', room)
			this.updateCurrentChatroom(null)
		})
	).subscribe()
	this.snackbar.open(`${this.user.username} left the room '${this.chatRoom.name}' succesfully`, 'Close', {
		duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'
	})
  }

  async toggleRoomAdmin(user_id: number) {
    if (this.chatRoom.owner_id === this.user.id) {
    //   console.log("clicked on user_id to make admin: " + user_id)
      this.roomAdmins = this.chatRoom.admins
    //   console.log('before', this.userAdminToggles[user_id])
  
      let admin: boolean = false
      for (let i = 0; i < this.roomAdmins.length; i++) {
        if (this.roomAdmins[i] === user_id) {
          admin = true;
          this.roomAdmins.splice(i, 1);
          break;
        }
      }
      this.userAdminToggles[user_id] = !admin
    //   this.cdr.detectChanges();
    //   console.log('after', this.userAdminToggles[user_id])
      if (!admin) {
        this.roomAdmins.push(user_id);
      }
      this.chatRoom.admins = this.roomAdmins
      this.chatService.toggleRoomAdmin(this.chatRoom)
    } else {
      console.log('Only channel owners can make users admin')
    }
  }

  chatMessage: FormControl = new FormControl(null, [Validators.required])

  //this function will trigger when @Input chatRoom changes in dashboard
  async ngOnChanges(changes: SimpleChanges) {
    this.chatService.leaveRoom(changes['chatRoom'].previousValue)
    if(this.chatRoom) {
      this.chatService.joinRoom(this.chatRoom)
      //resetting some stuff
      this.passwordValidated = false
      this.passwordPrompt.reset()
      this.setPasswordForm.reset()
      this.changePasswordForm.reset()
      //setting booleans & co. for pswd html logic
      this.chatRoom = await firstValueFrom(this.chatService.getChatroomInfo(this.chatRoom.id))
      this.isRoomProtected = this.chatRoom.type === 'protected'
      this.isRoomPrivate = this.chatRoom.type === 'private'
      this.chatRoomUsers = this.chatRoom.users
      this.user.id === this.chatRoom.owner_id ? this.isOwner = true : false

      this.chatRoom.users.forEach(user => {
        this.userAdminToggles[user.id] = this.chatRoom.admins.includes(user.id)
      })
    }
  }

  ngAfterViewInit() {
    if (this.chatRoom) {
      console.log('afterviewinit:', this.chatRoom.users)
	}
  
    // this.scrollToBottom()
  }

  ngOnDestroy() {
	console.log('ondestroy')
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
