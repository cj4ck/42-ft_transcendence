import { Injectable } from '@nestjs/common';
import { RoomI } from 'src/chat/model/room/room.interface';
import { CreateUserDto } from 'src/user/model/dto/create-user.dto';
import { LoginChatroomDto } from 'src/user/model/dto/login-chatroom.dto';
import { LoginUserDto } from 'src/user/model/dto/login-user.dto';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class UserHelperService {

	createUserDtoToEntity(createUserDto: CreateUserDto): UserI {
		return {
			email: createUserDto.email,
			username: createUserDto.username,
			password: createUserDto.password
		};
	}

	loginUserDtoToEntity(loginUserDto: LoginUserDto): UserI {
		return {
			email: loginUserDto.email,
			password: loginUserDto.password
		};
	}

	loginChatroomDtoToRoom(loginChatroomDto: LoginChatroomDto): RoomI {
		return {
			id: loginChatroomDto.room.id,
		}
	}

	loginChatroomDtoToPassword(loginChatroomDto: LoginChatroomDto): string {
		return (loginChatroomDto.password)
	}
}
