import { UserEntity } from "src/user/model/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";

@Entity()
export class ConnectedUserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    socketId: string;

    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

}