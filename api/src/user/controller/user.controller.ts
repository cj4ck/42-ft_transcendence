import { Body, Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { LoginChatroomResponseI } from '../model/login-chatroom-response.interface';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { LoginChatroomDto } from '../model/dto/login-chatroom.dto';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';

@Controller('users')
export class UserController {

	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService,
		private roomService: RoomService
	) { }

	@Post()
	async create(@Body() createUserDto: CreateUserDto ): Promise<UserI> {
		const userEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto)
		return this.userService.create(userEntity)
	}

	@Get()
	async findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10
	): Promise<Pagination<UserI>> {
		limit = limit > 100 ? 100: limit;
		return this.userService.findAll({page, limit, route: 'http://localhost:3000/api/users'})
	}

	@Get('/find-by-username')
	async findAllByUsername(@Query('username') username: string) {
		// console.log('FIND BY USERNAME - backend api call')
		return this.userService.findAllByUsername(username)
	}
	@Get('/find-by-id')
	async findById(@Query('id') id: number) {
		console.log('FIND BY Id - backend api call')
		return this.userService.findById(id)
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
	  const user: UserI = this.userHelperService.loginUserDtoToEntity(loginUserDto);
	  const loginResult = await this.userService.login(user);
	  if (loginResult.isTwoFactorRequired) {
		return { status: '2FA_required' };
	  }
	  return {
		access_token: loginResult.jwt,
		token_type: 'JWT',
		expires_in: 10000,
		status: true,
	  };
	}

	@Post('/2fa/verify-status')
	async verifyTwoFactorAuth(
	  @Body('email') email: string,
	  @Body('twoFactorAuthCode') twoFactorAuthCode: string,
	): Promise<LoginResponseI> {
	  const result = await this.userService.verifyTwoFactorAuthentication(email, twoFactorAuthCode);
	  return {
		access_token: result.jwt,
		token_type: 'JWT',
		expires_in: 10000,
		status: true,
	  };
	}


	@Post('loginChatroom')
	async loginChatroom(@Body() loginChatroomDto: LoginChatroomDto): Promise<boolean> {
		const roomEntity: RoomI = this.userHelperService.loginChatroomDtoToRoom(loginChatroomDto)
		const enteredPassword: string = this.userHelperService.loginChatroomDtoToPassword(loginChatroomDto)
		const loggedIn: boolean = await this.roomService.loginChatroom(roomEntity, enteredPassword)
		return loggedIn
	}

	@Post('change-username')
	async changeUsername(@Body() user: UserI): Promise<UserI> {
		const updatedUser: UserI = await this.userService.changeUsername(user)
		return updatedUser
	}
}
