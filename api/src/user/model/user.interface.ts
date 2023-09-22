import { RoomEntity } from 'src/chat/model/room.entity';

export interface UserI {
  id?: number;
  username?: string;
  email: string;
  password?: string;
//   rooms: RoomEntity[];
}

// properties with ? are optional
