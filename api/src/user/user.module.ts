import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user-service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/user.entity';
import { UserHelperService } from './service/user-helper/user-helper.service';
import { AuthModule } from 'src/auth/auth.module';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { RoomEntity } from 'src/chat/model/room/room.entity';
import { UserGatewayGateway } from './user-gateway/user-gateway.gateway';
import { FriendRequestEntity } from './model/friend-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoomEntity,
      FriendRequestEntity,
    ]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService, UserHelperService, RoomService, UserGatewayGateway],
  exports: [UserService]
})
export class UserModule {}
