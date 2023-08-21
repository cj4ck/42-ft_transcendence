import { UserI } from '../../user/model/user.interface'

export interface RoomI {
    id?: number;
    name?: string;
    description?: string;
    users?: UserI[];
    created_at?: Date;
    updates_at?: Date;
}