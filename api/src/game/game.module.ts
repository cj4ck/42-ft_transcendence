import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './model/game.entity';
import { GameController } from './game.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/service/user-service/user.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      GameEntity
    ])],
  providers: [GameGateway, GameService],
  controllers: [GameController]
})
export class GameModule {}
