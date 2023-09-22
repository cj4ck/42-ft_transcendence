// to store sth into our database

import { RoomEntity } from "src/chat/model/room.entity";
import { Column, PrimaryGeneratedColumn, Entity, BeforeInsert, ManyToMany, BeforeUpdate } from "typeorm";

@Entity()
export class UserEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({unique: true})
	username: string;
	
	@Column({unique: true}) //unique bc there cannot be two users with the same email
	email: string;

	@Column({select: false}) //if we make request with typeORM and try to find the user, this will automatically strip password from the return 
	password: string;

	@ManyToMany(() => RoomEntity, room => room.users)
	rooms: RoomEntity[]

	@BeforeInsert()
	@BeforeUpdate()
	emailToLowerCase() {
		this.email = this.email.toLocaleLowerCase();
		this.username = this.username.toLowerCase();
	}
}