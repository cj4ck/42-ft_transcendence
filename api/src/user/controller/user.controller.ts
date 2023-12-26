import { Body, Controller, Post, Get, Query, UseGuards, Request, HttpStatus, HttpException, Param, Put } from '@nestjs/common';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { LoginChatroomResponseI } from '../model/login-chatroom-response.interface';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { LoginChatroomDto } from '../model/dto/login-chatroom.dto';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Observable, of } from 'rxjs';
import { FriendRequestI, FriendRequestStatusI } from '../model/friend-request.interface';
import { AuthService } from 'src/auth/service/auth.service';

@Controller('users')
export class UserController {

	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService,
		private roomService: RoomService,
		private authService: AuthService,
	) { }

	@Post()
	async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
		const userEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto)
		return this.userService.create(userEntity)
	}

	// @Get()
	// async findAll(
	// 	@Query('page') page: number = 1,
	// 	@Query('limit') limit: number = 9
	// ): Promise<Pagination<UserI>> {
	// 	limit = limit > 100 ? 100 : limit;
	// 	return this.userService.findAll({ page, limit, route: 'http://localhost:3000/api/users' })
	// }

	@Get()
	async findAll(): Promise<UserI[]> {
		return this.userService.findAll()
	}

	@Get('/find-friends')
	async findAllFriends(@Query('id') id: number) {
		return this.userService.findAllFriends(id)
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

	@UseGuards(JwtAuthGuard)
	@Get('user-profile/:userId')
	findUserById(@Param('userId') userStringId: string): Observable<UserI> {
		const userId = parseInt(userStringId);
		if (Number.isNaN(userId)) {
			throw new HttpException(`${userStringId} is not a valid id.`, HttpStatus.BAD_REQUEST)
		}
		return this.userService.findUserById(userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('friend-request/send/:receiverId')
	sendFriendRequest(
		@Param('receiverId') receiverStringId: string,
		@Request() req,
	): Observable<FriendRequestI | { error: string }> {
		const receiverId = parseInt(receiverStringId);
		if (Number.isNaN(receiverId)) {
			throw new HttpException(`${receiverStringId} is not a valid id.`, HttpStatus.BAD_REQUEST)
		}
		return this.userService.sendFriendRequest(receiverId, req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/status/:userId')
	getFriendRequestStatus(
		@Param('userId') userStringId: string,
		@Request() req,
	): Observable<FriendRequestStatusI> {
		const userId = parseInt(userStringId);
		if (Number.isNaN(userId)) {
			throw new HttpException(`${userStringId} is not a valid id.`, HttpStatus.BAD_REQUEST)
		}
		const currentUser = req.user;
		if (userId === currentUser.id) {
			return of({ status: 'current' })
			// throw new HttpException('It is not possible to add yourself', HttpStatus.BAD_REQUEST)
		}
		return this.userService.getFriendRequestStatus(userId, currentUser);
	}

	@UseGuards(JwtAuthGuard)
	@Put('friend-request/response/:friendRequestId')
	respondToFriendRequest(
		@Param('friendRequestId') friendRequestStringId: string,
		@Body() statusResponse: FriendRequestStatusI,
	): Observable<FriendRequestStatusI> {
		const friendRequestId = parseInt(friendRequestStringId);
		if (Number.isNaN(friendRequestId)) {
			throw new HttpException(`${friendRequestStringId} is not a valid id.`, HttpStatus.BAD_REQUEST)
		}
		return this.userService.respondToFriendRequest(
			statusResponse.status,
			friendRequestId,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/me/received-requests')
	getFriendRequestsForUser(
		@Request() req,
	): Observable<FriendRequestStatusI[]> {
		return this.userService.getFriendRequestsForUser(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request-id')
	async getFriendRequestId(
		@Query('creatorId') creatorId: number,
		@Query('receiverId') receiverId: number
	): Promise<number> {
		return await this.userService.getFriendRequestId(creatorId, receiverId);
	}
}
