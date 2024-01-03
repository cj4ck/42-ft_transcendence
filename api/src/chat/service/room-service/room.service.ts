import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';
import { RoomEntity } from 'src/chat/model/room/room.entity';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {

	constructor(
		@InjectRepository(RoomEntity)
		private readonly roomRepository: Repository<RoomEntity>,
		private authService: AuthService,
		private userService: UserService
		) {}
	
	async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		room.mutedUsers = []
		for (const user of room.users) {
			if (creator.id === user.id){
				room.owner_id = creator.id
				return this.roomRepository.save(room)
			}
		}
		const newRoom = await this.addCreatorToRoom(room, creator)
		newRoom.owner_id = creator.id
		return this.roomRepository.save(newRoom)
	}

	async getRoom(roomId: number): Promise<RoomI> {
		return this.roomRepository.findOne({
			where: { id: roomId },
			relations: ['users']
		});
	}

	async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
		const query = this.roomRepository
		.createQueryBuilder('room')
		  .leftJoin('room.users', 'users')
		  .where('users.id = :userId OR room.type = :publicType', { userId, publicType: 'public' })
		  .leftJoinAndSelect('room.users', 'all_users')
		  .distinctOn(["room.id"])
		  .orderBy('room.id', 'DESC')
		return paginate(query, options);
	  }

	async getDmForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
		const query = this.roomRepository
		.createQueryBuilder('room')
		.leftJoin('room.users', 'users')
		.where('users.id = :userId AND room.type = :dmType', { userId, dmType: 'dm' })
		.leftJoinAndSelect('room.users', 'all_users')
		.orderBy('room.updated_at', 'DESC');
		return paginate(query, options)
	}

	async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		room.users.push(creator)
		return room
	}

	async setChatPassword(room: RoomI): Promise<RoomI> {
		const existingRoom = await this.getRoom(room.id);
		if (existingRoom) {
			const passwordHash: string = await this.hashPassword(room.password)
			existingRoom.password = passwordHash
			existingRoom.type = 'protected'
			return this.roomRepository.save(existingRoom);
		}
	  }

	async getChatPassword(room: RoomI): Promise<string> {
		const existingRoom = await this.getRoom(room.id);
		if (existingRoom) {
			const activePassword = existingRoom.password
			return activePassword
		}
	}

	private async hashPassword(password: string): Promise<string> {
		return this.authService.hashPassword(password);
	}

	async updateRoom(room: RoomI): Promise<RoomI> {
		let existingRoom = await this.getRoom(room.id);
		existingRoom = room
		return this.roomRepository.save(existingRoom);
	}

	async loginChatroom(room: RoomI, password: string): Promise<boolean> {
		try {
			const foundRoom: RoomI = await this.getRoom(room.id)
			if (foundRoom) {
				const matches: boolean = await this.validatePassword(password, foundRoom.password)
				if (matches) {
					return true					
				} else {
					throw new HttpException('Passwords do not match, room locked', HttpStatus.UNAUTHORIZED)
				}
			} else {
				throw new HttpException('Room not found', HttpStatus.NOT_FOUND)
			}
		} catch {
			throw new HttpException('Room not found!', HttpStatus.UNAUTHORIZED)
		}
	}

	private async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
		return this.authService.comparePasswords(password, storedPasswordHash)
	}

	async removeChatPassword(roomId: number): Promise<RoomI> {
		const existingRoom = await this.getRoom(roomId);
		if (!existingRoom) {
			existingRoom.password = null
			existingRoom.type = 'private'
			return this.roomRepository.save(existingRoom);
		}
	  }

	async leaveChat(userId: number, roomId: number): Promise<RoomI> {
		const existingRoom = await this.getRoom(roomId)
		existingRoom.users = existingRoom.users.filter(user => user.id !== userId)
		if (userId === existingRoom.owner_id) {
			existingRoom.owner_id = null
		}
		return this.roomRepository.save(existingRoom)
	}
}
