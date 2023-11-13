import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';
import { RoomEntity } from 'src/chat/model/room/room.entity';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {

	constructor(
		@InjectRepository(RoomEntity)
		private readonly roomRepository: Repository<RoomEntity>,
		private authService: AuthService,
		) {}
	
	async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		for (const user of room.users) {
			// console.log('user#:', user.id, user.username)
			if (creator.id === user.id){
				// console.log('type: ', room.type)
				// console.log('creator: ', creator)
				room.owner_id = creator.id
				// console.log('owner:', room.owner_id)
				return this.roomRepository.save(room)
			}
		}
		// console.log('will add creator to room [id]:', creator.id)
		const newRoom = await this.addCreatorToRoom(room, creator)
		// console.log('type: ', room.type)
		// console.log('creator: ', creator)
		// newRoom.owner = creator
		newRoom.owner_id = creator.id
		// console.log('owner:', newRoom.owner_id)
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
		  
		//for debugging sql query x pagination
		// const querySQL = query.getQueryAndParameters();
		// console.log('Generated SQL query:', querySQL[0]);
	  
		// const result = await paginate(queryBuilder, options);
		// console.log('Result:', result);
	  
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
		if (!existingRoom) {
			console.log('room not found')
		} else {
			// console.log("new password", room.password)
			const passwordHash: string = await this.hashPassword(room.password)
			// console.log(passwordHash, '-> password hash in set password')
			existingRoom.password = passwordHash
			existingRoom.type = 'protected'
			// Save the updated room to the database
			return this.roomRepository.save(existingRoom);
		}
	  }

	async getChatPassword(room: RoomI): Promise<string> {
		const existingRoom = await this.getRoom(room.id);
		if (!existingRoom) {
			console.log('room not found; password not set')
		}
		const activePassword = existingRoom.password
		return activePassword
	}

	private async hashPassword(password: string): Promise<string> {
		return this.authService.hashPassword(password);
	}

	async updateAdminList(room: RoomI): Promise<RoomI> {
		console.log('update room admins')
		// Assuming you have a method to retrieve the room from the database
		const existingRoom = await this.getRoom(room.id);
		if (!existingRoom) {
			console.log('Room not found')
		}
		existingRoom.admins = room.admins
		// Save the updated room to the database
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
			console.log('room not found')
		} else {
			existingRoom.password = null
			existingRoom.type = 'private'
			return this.roomRepository.save(existingRoom);
		}
	  }
}
