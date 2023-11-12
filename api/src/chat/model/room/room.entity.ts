import { UserEntity } from "src/user/model/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JoinedRoomEntity } from "../joined-room/joined-room.entity";
import { MessageEntity } from "../message/message.entity";
import { UserI } from "src/user/model/user.interface";

@Entity()
export class RoomEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string

	@Column({nullable: true})
	description: string

	@ManyToMany(() => UserEntity)
	@JoinTable()
	users: UserEntity[]

	@OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
	joinedUsers: JoinedRoomEntity[]

	@OneToMany(() => MessageEntity, message => message.room)
	messages: MessageEntity[]

	@CreateDateColumn()
	created_at: Date

	@UpdateDateColumn()
	updated_at: Date

	@Column({nullable: true})
	type: string

	@Column({nullable: true})
	owner_id: number

	@Column({ nullable: true }) // Assuming the password can be nullable
	password: string; // Store the password as a string

	@Column('int', { array: true, default: [] })
	admins: number[];
}