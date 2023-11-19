import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './model/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameEntity
    ])],
  providers: [GameGateway, GameService]
})
export class GameModule {}
