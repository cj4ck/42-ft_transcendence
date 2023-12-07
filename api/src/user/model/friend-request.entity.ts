import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequestStatus } from "./friend-request.interface";
import { UserEntity } from "./user.entity";

@Entity('request')
export class FriendRequestEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, userEntity => userEntity.sentFriendRequests)
	creator: UserEntity;

	@ManyToOne(() => UserEntity, userEntity => userEntity.receivedFriendRequests)
	receiver: UserEntity;

	@Column()
	status: FriendRequestStatus;
}
