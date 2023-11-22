import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PlayerI } from "./player.interface";

@Entity()
export class GameEntity {

	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	p1Id?: number;
	@Column()
	p2Id?: number;

	@Column()
	p1Score?: number;
	@Column()
	p2Score?: number;

	p1Pos?: number;
	p2Pos?: number;
	ballX?: number;
	ballY?: number;
	ballMoveX?: number;
	ballMoveY?: number;
}
