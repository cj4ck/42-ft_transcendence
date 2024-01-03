import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { AuthService } from 'src/auth/service/auth.service';
import { Socket, Server } from 'socket.io'
import { UserI } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RoomService } from '../service/room-service/room.service';
import { RoomI } from '../model/room/room.interface';
import { PageI } from '../model/page.interface';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { ConnectedUserI } from '../model/connected-user/connected-user.interface';
import { JoinedRoomService } from '../service/joined-room/joined-room.service';
import { MessageService } from '../service/message/message.service';
import { MessageI } from '../model/message/message.interface';
import { JoinedRoomI } from '../model/joined-room/joined-room.interface';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200', 'http://127.0.0.1:3000', 'http://127.0.0.1:4200'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService)
     {}

    async onModuleInit() {
      await this.connectedUserService.deleteAll()
      await this.joinedRoomService.deleteAll()
    }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization)
      const user: UserI = await this.userService.getOne(decodedToken.user.id)
      if (!user) {
        return this.disconnect(socket)
      } else {
        socket.data.user = user
        const rooms = await this.roomService.getRoomsForUser(user.id, {page: 1, limit: 15});
        rooms.meta.currentPage = rooms.meta.currentPage -1
        await this.connectedUserService.create({socketId: socket.id, user})
        return this.server.to(socket.id).emit('rooms', rooms)
      }
    }
    catch {
      return this.disconnect(socket)
    }
  }

  async handleDisconnect(socket: Socket) {
    await this.connectedUserService.deleteBySocketId(socket.id)
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

@SubscribeMessage('createRoom')
    async onCreateRoom(socket: Socket, room: RoomI) {
    room.admins = [];
    room.admins.push(socket.data.user.id)
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user)
    for(const user of createdRoom.users) {
        const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user)
        const rooms = await this.roomService.getRoomsForUser(user.id, {page: 1, limit: 15})
        // substract page -1 to match the ng material paginator
        rooms.meta.currentPage = rooms.meta.currentPage - 1
        for(const connection of connections) {
            await this.server.to(connection.socketId).emit('rooms', rooms)
        }
    }
  }

  @SubscribeMessage('addUserToRoom')
  async onAddUserToRoom(socket: Socket, room: RoomI) {
      const newRoom = await this.roomService.addCreatorToRoom(room, socket.data.user)
    this.roomService.updateRoom(newRoom)
  }

  // need to update this to use id, bc usernames can be duplicated
  @SubscribeMessage('createDmRoom')
    async onCreateDmRoom(socket: Socket, username: string) {
    const creator = socket.data.user
    const guest: UserI = await this.userService.findOneByUsername(username)
    const dmRooms = await this.roomService.getDmForUser(creator.id, {page: 1, limit: 15})
    for (const dmRoom of dmRooms.items) {
        for (const user of dmRoom.users) {
        if (user.id === guest.id) {
            return;
        }
        }
    }
    let privateRoom: RoomI
    const chatMembers: UserI[] = [guest, creator];
    privateRoom = {
        name: `DM: ${guest.username}`,
        description : `Private chat between ${creator.username} and ${guest.username}`,
        type: 'dm',
        users: chatMembers
    }
    await this.onCreateRoom(socket, privateRoom)
  }

  @SubscribeMessage('toggleRoomAdmin')
  async toggleRoomAdmin(socket: Socket, updatedRoom: RoomI) {
    await this.roomService.updateRoom(updatedRoom)
    return this.server.to(socket.id).emit('checkAdminList', updatedRoom.admins)
  }

  @SubscribeMessage('updateRoom')
  async updateRoom(socket: Socket, updatedRoom: RoomI)
  {
    const roomToEmit = await this.roomService.updateRoom(updatedRoom)
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(roomToEmit)
    for (const user of joinedUsers) {
        this.server.to(user.socketId).emit('updatedRoom', roomToEmit)
    }
  }

  @SubscribeMessage('toggleUserBlock')
  async toggleUserBlock(socket: Socket, updatedUser: UserI) {
    await this.userService.updateBlockedIds(updatedUser)
    return this.server.to(socket.id).emit('checkBlockedRes', updatedUser.blocked)
  }


    @SubscribeMessage('paginateRooms')
    async onPaginateRoom(socket: Socket, page: PageI) {

        if (socket.data.user) {
            const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, this.handleIncomingPageRequest(page))
            rooms.meta.currentPage = rooms.meta.currentPage - 1
            return this.server.to(socket.id).emit('rooms', rooms)
        }
  }

    @SubscribeMessage('joinRoom')
    async onJoinRoom(socket: Socket, room: RoomI) {
        const messages = await this.messageService.findMessagesForRoom(room, {limit: 10, page: 1})
        messages.meta.currentPage = messages.meta.currentPage - 1
        await this.joinedRoomService.create({socketId: socket.id, user: socket.data.user, room})
        await this.server.to(socket.id).emit('messages', messages)
  }

  @SubscribeMessage('leaveRoom')
        async onLeaveRoom(socket: Socket) {
        await this.joinedRoomService.deleteBySocketId(socket.id)
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
        const createdMessage: MessageI = await this.messageService.create({...message, user: socket.data.user})
        const room: RoomI = await this.roomService.getRoom(createdMessage.room.id)
        const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room)
        for (const user of joinedUsers) {
            this.server.to(user.socketId).emit('messageAdded', createdMessage)
        }
  }

  @SubscribeMessage('setChatPassword')
    async onSetPassword(socket: Socket, room: RoomI) {
        try {
            const updatedRoom = await this.roomService.setChatPassword(room);
            this.server.to(socket.id).emit('updatedRoom', updatedRoom);
        } catch (error) {
            console.error('Error setting password:', error.message);
            socket.emit('setError', { message: 'Failed to set password', error });
        }
    }

    @SubscribeMessage('getBlockedUsers')
    async checkBlockedUsers(socket: Socket, user_id: number) {
        try {
            const blockedUsers = await this.userService.getBlockedUsers(user_id)
            this.server.emit('checkBlockedRes', blockedUsers)
        } catch (error) {
            console.error('Error checking password', error.message)
            socket.emit('checkError', {message: 'Failed to check password', error})
        }
    }

    @SubscribeMessage('removeChatPassword')
    async onRemoveChatPassword(socket: Socket, roomId: number) {
        try {
            const updatedRoom = await this.roomService.removeChatPassword(roomId)
            if (updatedRoom) {
                this.server.to(socket.id).emit('updatedRoom', updatedRoom)
            }
        } catch (error) {
            console.error('Error setting password:', error.message);
            socket.emit('setError', { message: 'Failed to remove password', error });
        }
    }

    @SubscribeMessage('getChatroomInfo')
    async onGetChatroomUsers(socket: Socket, roomId: number) {
        try {
            const requestedRoom = await this.roomService.getRoom(roomId)
            if (requestedRoom) {
                this.server.to(socket.id).emit('hereYouGo', requestedRoom)
            }
        } catch (error) {
            console.error('Error getting room by Id', error.message)
            socket.emit('setError', { message: 'Failed to get chatroom', error });
        }
    }

    @SubscribeMessage('leaveChat')
    async onLeaveChat(socket: Socket, ids: number[]) {
        const userId = ids[0]
        const roomId = ids[1]
        try {
            const updatedRoom = await this.roomService.leaveChat(userId, roomId)
            if (updatedRoom) {
                const rooms = await this.roomService.getRoomsForUser(userId, {page: 1, limit: 15});
                rooms.meta.currentPage = rooms.meta.currentPage -1
                return this.server.to(socket.id).emit('rooms', rooms)
            }
        } catch (error) {
            socket.emit('setError', { message: 'Failed to get chatroom', error });
        }
    }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    page.page = page.page + 1
    return page
  }
}


