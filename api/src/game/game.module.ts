import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './model/game.entity';
import { GameController } from './game.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameEntity
    ])],
  providers: [GameGateway, GameService],
  controllers: [GameController]
})
export class GameModule {}
