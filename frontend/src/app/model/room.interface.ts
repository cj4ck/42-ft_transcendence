import { Meta } from "./meta.interface"
import { UserI } from "./user.interface"

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

export interface RoomPaginateI {
	items: RoomI[]
	meta: Meta
}

export interface MutedUserI {
	id: number;
	muteExpiry: Date;
}