import { UserI } from "src/user/model/user.interface";

export interface GameI {
	id?: number;
	player1?:  UserI;
	player2?:  UserI;
	p1Pos: number;
	p2Pos: number;
	ballX: number;
	ballY: number;
	ballMoveX: number;
	ballMoveY: number;
	p1Score: number;
	p2Score: number;
}
