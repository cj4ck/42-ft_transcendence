import { UserI } from "src/user/model/user.interface";

export interface PlayerI {
	socketId?: string;
	user?: UserI
	quickGame?: boolean;
}
