import { UserI } from "./user.interface";

export type FriendRequestStatus = 'not-sent'
| 'pending'
| 'accepted'
| 'declined'
| 'waiting-for-current-user-response'
| 'current';

export interface FriendRequestStatusI {
	status?: FriendRequestStatus;
}

export interface FriendRequestI {
	id?: number;
	creator?: UserI;
	receiver?: UserI;
	status?: FriendRequestStatus;
}
