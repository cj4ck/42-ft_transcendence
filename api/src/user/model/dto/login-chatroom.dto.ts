import { IsNotEmpty } from "class-validator";
import { RoomI } from "src/chat/model/room/room.interface";

export class LoginChatroomDto {

	@IsNotEmpty()
	room: RoomI
	
	@IsNotEmpty()
	password: string;
}