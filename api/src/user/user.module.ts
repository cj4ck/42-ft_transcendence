import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user-service/user.service';
import { UserEntity } from './model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHelperService } from './service/user-helper/user-helper.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthMiddleware } from 'src/middleware/auth.middleware';

@Module({
  imports: [
	TypeOrmModule.forFeature([UserEntity]),
	AuthModule
],
  controllers: [UserController],
  providers: [UserService, UserHelperService],
  // MIDDLEWARE - added below line:
  exports: [UserService]
})
export class UserModule {}
