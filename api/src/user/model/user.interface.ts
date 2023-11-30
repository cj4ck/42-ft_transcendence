import { StrictMatchKeysAndValues } from "typeorm";

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
}
