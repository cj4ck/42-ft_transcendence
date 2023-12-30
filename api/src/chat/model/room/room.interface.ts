import { UserI } from "src/user/model/user.interface"

export interface RoomI {
	id?: number
	name?: string
	description?: string
	users?: UserI[]
	created_at?: Date
	updated_at?: Date
	type?: string
	owner_id?: number
	password?: string
	admins?: number[]
	mutedUsers?: MutedUserI[]
	bannedUsers?: number[]
}

export interface MutedUserI {
	id: number;
	muteExpiry: Date;
}