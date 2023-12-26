import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from '../../model/user.interface';
import { Like, Repository } from 'typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { FriendRequestI, FriendRequestStatus, FriendRequestStatusI } from 'src/user/model/friend-request.interface';
import { FriendRequestEntity } from 'src/user/model/friend-request.entity';


@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private authService: AuthService,
		@InjectRepository(FriendRequestEntity)
		private readonly friendRequestRepository: Repository<FriendRequestEntity>,
	) {}

	async create(newUser: UserI): Promise<UserI> {
		try {
			const exists: boolean = await this.mailExists(newUser.email)
			if(!exists) {
				const passwordHash: string = await this.hashPassword(newUser.password)
				newUser.password = passwordHash
				const user = await this.userRepository.save(this.userRepository.create(newUser))
				return this.findOne(user.id)
			} else {
				throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
			}
		} catch {
			throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
		}
	}

	async login(user: UserI): Promise<{ jwt?: string; isTwoFactorRequired?: boolean }> {
		try {
			const foundUser: UserI = await this.findByEmail(user.email.toLowerCase());
			if (!foundUser) {
				throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
			}
			const passwordIsValid: boolean = await this.validatePassword(user.password, foundUser.password);
			if (!passwordIsValid) {
				throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
			}
			const payload: UserI = await this.authService.findByEmail(foundUser.email);
			if (payload.isTwoFactorEnabled) {
				return { isTwoFactorRequired: true };
			}
			// payload.activityStatus = 'online'
			// await this.authService.saveUser(payload)
			const jwt = await this.authService.generateJwt(payload);
				return { jwt };
		} catch (error) {
		console.error('Login error:', error);
		throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async verifyTwoFactorAuthentication(email: string, twoFactorAuthCode: string): Promise<{ jwt: string }> {
		const user: UserI = await this.authService.findByEmail(email);
		if (!user || !user.isTwoFactorEnabled) {
			throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
		}
		const is2faCodeValid = this.authService.verifyTwoFactorSecret(user.twoFactorSecret, twoFactorAuthCode);
		if (!is2faCodeValid) {
			throw new HttpException('Invalid two-factor authentication code', HttpStatus.FORBIDDEN);
		}
		// user.activityStatus = 'online'
		// this.authService.saveUser(user)
		const jwt = await this.authService.generateJwt(user);
		return { jwt };
	}

	async findAll(): Promise<UserI[]> {
		return this.userRepository.find();
	}

	async findAllFriends(userId: number): Promise<UserI[]> {
		const friendRequests = await this.friendRequestRepository.find({
			where: [
				{ creator: { id: userId }, status: 'accepted' },
				{ receiver: { id: userId }, status: 'accepted' }
			],
			relations: ['creator', 'receiver']
		});
	
		const friends: UserI[] = [];
	
		friendRequests.forEach(request => {
			if (request.creator.id === userId) {
				friends.push(request.receiver);
			} else {
				friends.push(request.creator);
			}
		});
		return friends;
	}
	
	async findAllByUsername(username: string): Promise<UserI[]> {
		return this.userRepository.findBy({
			username: Like(`%${username.toLowerCase()}%`)
		})
	}

	async findById(id: number): Promise<UserI> {
		return this.userRepository.findOne({
			where : {
				id
			}
		})
	}
	async findOneByUsername(username: string): Promise<UserI> {
		// console.log('findonebyusername ' + username)
		return this.userRepository.findOne({
			where: {
				username: Like(`%${username.toLowerCase()}%`)
			}
		})
	}

	async doesUsernameExist(username: string) {
			const user = await this.userRepository.findOne({
			  where: {
				username: Like(`%${username.toLowerCase()}%`),
			  },
			});
			if (user === null)
				return (false)
			else
				return (true)
	}

	async updateBlockedIds(user: UserI): Promise<UserI> {
		console.log('update Blocked Ids')
		// Assuming you have a method to retrieve the room from the database
		const existingUser = await this.getOne(user.id);
		if (!existingUser) {
			console.log('user not found')
		}
		existingUser.blocked = user.blocked
		// Save the updated room to the database
		return this.userRepository.save(existingUser);
	}

	async getBlockedUsers(user_id: number): Promise<number[]> {
		// console.log('get blocked users ' + user_id)
		const foundUser = await this.userRepository.findOne({ where: { id: user_id } })
		return foundUser.blocked
		// .then(user => {
		//   if (user) {
		// 	console.log('User found, returning ' + user.blocked);
		// 	return(user.blocked);
		//   } else {
		// 	console.log('User not found');
		// 	return []
		//   }
		// })
		// .catch(error => {
		// 	console.log(error)
		// 	return []
		// });
		// return []
	}

	findUserById(id: number): Observable<UserI> {
		return from(
			this.userRepository.findOneBy({ id }),
		).pipe(
			map((user: UserI) => {
				if (!user) {
					throw new HttpException('User not found', HttpStatus.NOT_FOUND);
				}
				return user;
			})
		)
	}

	hasRequestBeenSentOrReceived(creator: UserI, receiver: UserI): Observable<boolean> {
		return from(this.friendRequestRepository.findOne({
			where: [
				{ creator: { id: creator.id }, receiver: { id: receiver.id }},
				{ creator: { id: receiver.id }, receiver: { id: creator.id } },
			],
		}),
		).pipe(
			switchMap((friendRequest: FriendRequestI) => {
				if (!friendRequest) return of(false);
				return of(true);
			})
		);
	}

	sendFriendRequest(
		receiverId: number,
		creator: UserI,
	): Observable<FriendRequestI | { error: string }> {
		if (receiverId === creator.id) {
			return of({ error: 'It is not possible to add yourself' });
		}
		return from(this.findUserById(receiverId)).pipe(
			switchMap((receiver: UserI) => {
				return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
					switchMap((hasRequestBeenSentOrReceived: boolean) => {
						if (hasRequestBeenSentOrReceived) return of({ error: 'A friend request has already been sent or received.' })
						let friendRequest: FriendRequestI = {
							creator,
							receiver,
							status: 'pending',
						}
						return from(this.friendRequestRepository.save(friendRequest));
					})
				);
			}),
		)
	}

	getFriendRequestStatus(
		userId: number,
		currentUser: UserI,
	): Observable<FriendRequestStatusI> {
		return this.findUserById(userId).pipe(
			switchMap((receiver: UserI) => {
				return from(
					this.friendRequestRepository.findOne({
						where: [
							{ creator: { id: currentUser.id }, receiver: { id: receiver.id }},
							{ creator: { id: receiver.id }, receiver: { id: currentUser.id }},
						],
						relations: ['creator', 'receiver'],
					}),
				);
			}),
			switchMap((friendRequest: FriendRequestI) => {
				if (friendRequest?.receiver.id === currentUser.id) {
					if (friendRequest?.status === 'pending') {
						return of({ status: 'waiting-for-current-user-response' as FriendRequestStatus });
					}
					else {
						return of({ status: friendRequest?.status })
					}
				}
				return of({ status: friendRequest?.status || 'not-sent' });
			}),
		)
	}

	getFriendRequestById(friendRequestId: number): Observable<FriendRequestI> {
		let friendRequest =  from(
			this.friendRequestRepository.findOneBy({
				id: friendRequestId,
			})
		);
		if (!friendRequest) {
			throw new HttpException('Friend Request not found', HttpStatus.NOT_FOUND);
		}
		return friendRequest;
	}

	respondToFriendRequest(
		statusResponse: FriendRequestStatus,
		friendRequestId: number,
	): Observable<FriendRequestStatusI> {
		return this.getFriendRequestById(friendRequestId).pipe(
			switchMap((friendRequest: FriendRequestEntity) => {
				return from(
					this.friendRequestRepository.save({
						...friendRequest,
						status: statusResponse,
					}),
				);
			}),
		);
	}

	getFriendRequestsForUser(
		currentUser: UserI): Observable<FriendRequestI[]> {
		return from(this.friendRequestRepository.find({
			where: [{ receiver: { id: currentUser.id }}],
			relations: ['receiver', 'creator'],
		}))
	}

	async getFriendRequestId(creatorId: number, receiverId: number): Promise<number> {
		const friendRequest: FriendRequestEntity[] = await this.friendRequestRepository.find({
			where: [
				{ creator: { id: creatorId } , receiver: { id: receiverId } },
			],
			relations: ['creator', 'receiver']
		});
		return friendRequest.length > 0 ? friendRequest[0].id : null;
	}

	// also returns password
	private async findByEmail(email: string): Promise<UserI> {
		return this.userRepository.findOne({where: { email }, select: ['id', 'email', 'username', 'password']});
	}

	private async hashPassword(password: string): Promise<string> {
		return this.authService.hashPassword(password);
	}

	private async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
		return this.authService.comparePasswords(password, storedPasswordHash);
	}

	async findOne(id: number): Promise<UserI> {
		return this.userRepository.findOne({ where: { id } });
	}

	public getOne(id: number): Promise<UserI> {
		return this.userRepository.findOneOrFail({ where : { id }});
	}

	private async mailExists(email: string): Promise<boolean> {
		const user = await this.userRepository.findOne({where : { email }});
			if(user) {
				return true
			} else {
				return false
			}
	}

	public async savePlayer(user: UserI)
	{
		await this.userRepository.save(user);
	}

	async changeUsername(user: UserI): Promise<UserI> {
		const existingUser = await this.getOne(user.id)
		existingUser.username = user.username
		return this.userRepository.save(existingUser);
	}
 }
