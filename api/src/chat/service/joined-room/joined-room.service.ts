import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinedRoomEntity } from 'src/chat/model/joined-room/joined-room.entity';
import { JoinedRoomI } from 'src/chat/model/joined-room/joined-room.interface';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class JoinedRoomService {

	constructor(
		@InjectRepository(JoinedRoomEntity)
		private readonly joinedRoomRepository: Repository<JoinedRoomEntity>
	) { }

	async create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI> {
		// console.log("create joined room id " + joinedRoom.id)
		// console.log("create joined room user " + joinedRoom.user.username)
		return this.joinedRoomRepository.save(joinedRoom)
	}

	// async findByUser(user: UserI): Promise<JoinedRoomI[]> {
	// 	return this.joinedRoomRepository.find( {where:{user}} )
	// }

	async findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
		// console.log('find by room id: ' + room.id)
		return this.joinedRoomRepository.query(`
		  SELECT * FROM joined_room_entity
		  WHERE "roomId" = \$1
		`, [room.id]);
	}

	// async findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
	// 	console.log('find by room id: ' + room.id)
	// 	return this.joinedRoomRepository.find({ where: {room: room}})
	// }

	// async findByRoomId(id: number): Promise<JoinedRoomI[]> {
	// 	return this.joinedRoomRepository.find({ where: { id }})
	// }

	async deleteBySocketId(socketId: string) {
		return this.joinedRoomRepository.delete({socketId})
	}

	async deleteAll() {
		await this.joinedRoomRepository
		.createQueryBuilder()
		.delete()
		.execute()
	}
}
