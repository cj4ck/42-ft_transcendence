import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { AuthController } from './controller/auth.controller';
import { FortyTwoAuthGuard } from './guards/forty-two.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { SessionSerializer } from './serializer/serializer';
import { AuthService } from './service/auth.service';
import { FortyTwoStrategy } from './strategies/forty-two.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async(configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '10000s' }
      })
    }),
    TypeOrmModule.forFeature([UserEntity])
  ],
  providers: [
    SessionSerializer,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    FortyTwoStrategy,
    FortyTwoAuthGuard,
  ],
  exports: [AuthService]
})
export class AuthModule {}

