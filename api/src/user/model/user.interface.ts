import { Meta } from "./meta.interface";

export interface UserI {
	id?: number;
	username?:  string;
	email: string;
	password?: string;
	score?: number;
	wins?: number;
	lost?: number;
	twoFactorSecret?: string;
	isTwoFactorEnabled?: boolean;
	temp2faSecret?: string;
	blocked?: number[];
}

export interface UserPaginateI {
	items: UserI[],
	meta: Meta
}
