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
import { ActivityGateway } from './user-gateway/activity/activity.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoomEntity,
      FriendRequestEntity,
    ]),
    AuthModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileExtName = extname(file.originalname).toLowerCase();
          // Ensure the file is a PNG, or throw an error
          if (fileExtName !== '.png') {
            callback(new Error('Only .png files are allowed!'), null);
            return;
          }
          const filename = `${uniqueSuffix}.png`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserHelperService, RoomService, UserGatewayGateway, ActivityGateway],
  exports: [UserService]
})
export class UserModule {}
