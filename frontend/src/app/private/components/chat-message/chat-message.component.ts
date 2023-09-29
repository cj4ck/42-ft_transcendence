import { Component, Input } from '@angular/core';
import { MessageI } from 'src/app/model/message.interface';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent {

  @Input() message: MessageI

  constructor() { }

  

}
