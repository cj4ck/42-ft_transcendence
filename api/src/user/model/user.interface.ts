import { StrictMatchKeysAndValues } from "typeorm";

export interface UserI {
	id?: number;
	username?:  string;
	email: string;
	password?: string;
	twoFactorSecret?: string;
	isTwoFactorEnabled?: boolean;
	temp2faSecret?: string;
}