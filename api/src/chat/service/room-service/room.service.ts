import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
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
		private readonly userService: UserService
		) {}
	
	async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		// check if creator is already in room, ie dont need to add
		for (const user of room.users) {
			console.log('user#:', user.id, user.username)
			// creator in room 
			if (creator.id === user.id){
				console.log('type: ', room.type)
				console.log('creator: ', creator)
				room.owner = creator
				console.log('owner:', room.owner)
				return this.roomRepository.save(room)
			}
		}
		console.log('will add creator to room [id]:', creator.id)
		// room.type = room.isPrivate ? 'private' | 'public'
		const newRoom = await this.addCreatorToRoom(room, creator)
		console.log('type: ', room.type)
		console.log('creator: ', creator)
		room.owner = creator
		console.log('owner:', room.owner)
		return this.roomRepository.save(newRoom)
		// this.printAllRooms();
	}

	async getRoom(roomId: number): Promise<RoomI> {
		return this.roomRepository.findOne({
			where: { id: roomId },
			relations: ['users']
		});
	}

	async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
		// console.log('get rooms for user')
		const query = this.roomRepository
		.createQueryBuilder('room')
		.leftJoin('room.users', 'users')
		.where('users.id = :userId OR room.type = :publicType', { userId, publicType: 'public' })
		.leftJoinAndSelect('room.users', 'all_users')
		.orderBy('room.updated_at', 'DESC');
		return paginate(query, options)
	}

	async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
		room.users.push(creator)
		return room
	}

	async setChatPassword(room: RoomI): Promise<RoomI> {
		// Assuming you have a method to retrieve the room from the database
		const existingRoom = await this.getRoom(room.id);
		if (!existingRoom) {
			console.log('room not found')
		}
		existingRoom.password = room.password;
		// Save the updated room to the database
		return this.roomRepository.save(existingRoom);
	  }

	async getChatPassword(room: RoomI): Promise<string> {
		const existingRoom = await this.getRoom(room.id);
		if (!existingRoom) {
			console.log('room not found; password not set')
		}
		const activePassword = existingRoom.password
		return activePassword
	}
}
