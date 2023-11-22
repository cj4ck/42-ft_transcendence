import { UserI } from "src/user/model/user.interface";
import { PlayerI } from "./player.interface";

export interface GameI {
	id?: number;
	p1Score?: number;
	p2Score?: number;
	p1Id?: number;
	p2Id?: number;


	player1?: PlayerI;
	player2?: PlayerI;
	p1Pos?: number;
	p2Pos?: number;
	ballX?: number;
	ballY?: number;
	ballMoveX?: number;
	ballMoveY?: number;
}
