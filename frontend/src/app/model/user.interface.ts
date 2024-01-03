import { Meta } from "./meta.interface";

export interface UserI {
	id?: number;
	username?:  string;
	avatar?:  string;
	email: string;
	password?: string;
	score?: number;
	wins?: number;
	losses?: number;
	isTwoFactorEnabled?: boolean;
	blocked?: number[];
	activityStatus?: ActivityStatus;
	fresh?: boolean	
}

export interface UserPaginateI {
	items: UserI[],
	meta: Meta
}

export type ActivityStatus = 'online' | 'in game' | 'offline'