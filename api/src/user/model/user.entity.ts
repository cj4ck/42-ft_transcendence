// to store sth into our database

import { Column, PrimaryGeneratedColumn, Entity, BeforeInsert } from "typeorm";

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

	@BeforeInsert()
	emailToLowerCase() {
		this.email = this.email.toLocaleLowerCase();
	}
}