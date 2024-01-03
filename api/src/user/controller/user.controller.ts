import { Body, Controller, Post, Get, Query, UseGuards, Request, HttpStatus, HttpException, Param, Put, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { LoginChatroomDto } from '../model/dto/login-chatroom.dto';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { map, Observable, of } from 'rxjs';
import { FriendRequestI, FriendRequestStatusI } from '../model/friend-request.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {

	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService,
		private roomService: RoomService,
	) { }

	@Post()
	async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
		const userEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto)
		return this.userService.create(userEntity)
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async findAll(): Promise<UserI[]> {
		return this.userService.findAll()
	}

	@Get('/find-friends')
	@UseGuards(JwtAuthGuard)
	async findAllFriends(@Query('id') id: number) {
		return this.userService.findAllFriends(id)
	}

	@Get('/find-by-username')
	@UseGuards(JwtAuthGuard)
	async findAllByUsername(@Query('username') username: string) {
		return this.userService.findAllByUsername(username)
	}

	@Get('/find-by-id')
	@UseGuards(JwtAuthGuard)
	async findById(@Query('id') id: number) {
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
	@UseGuards(JwtAuthGuard)
	async loginChatroom(@Body() loginChatroomDto: LoginChatroomDto): Promise<boolean> {
		const roomEntity: RoomI = this.userHelperService.loginChatroomDtoToRoom(loginChatroomDto);
		const enteredPassword: string = this.userHelperService.loginChatroomDtoToPassword(loginChatroomDto);
		const loggedIn: boolean = await this.roomService.loginChatroom(roomEntity, enteredPassword);

		return loggedIn;
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
		return this.userService.getFriendRequestsForUser(req.user).pipe(
			map((friendRequests: FriendRequestI[]) => friendRequests.filter(
				request => request.status === 'pending'
			))
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request-id')
	async getFriendRequestId(
		@Query('creatorId') creatorId: number,
		@Query('receiverId') receiverId: number
	): Promise<number> {
		return await this.userService.getFriendRequestId(creatorId, receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('changeUsername')
	async changeUsername(@Body() user: UserI): Promise<boolean> {
		const usernameChanged: boolean = await this.userService.changeUsername(user)
		return usernameChanged
	}

	@UseGuards(JwtAuthGuard)
	@Post('avatar-upload')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file) {
		if (!file) {
			throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
		}
		if (!file.originalname.match(/\.png$/)) {
			throw new HttpException('Only .png image files are allowed!', HttpStatus.BAD_REQUEST);
		}
		const filePath = `uploads/${file.filename}`;
		return { filePath: filePath };
	}

	@UseGuards(JwtAuthGuard)
	@Post('changeAvatar')
	async changeAvatar(@Body() user: UserI): Promise<boolean> {
		const avatarChanged: boolean = await this.userService.changeAvatar(user)
		return avatarChanged
	}

	@UseGuards(JwtAuthGuard)
	@Post('fresh')
	async fresh(@Body() userId: number) {
		var user = await this.userService.findById(userId)
		if (user.fresh)
		{
			user.fresh = false
			await this.userService.savePlayer(user)
		}
	}


	/* Not yet implemented, just idea
	@Get(':imgpath')
	seeUploadedFile(@Param('imgpath') image,
	@Res() res) {
		return res.sendFile(image, {root: 'uploads'});
	} */
}
