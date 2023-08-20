import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot ({
=======
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './user/model/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
    {
>>>>>>> users
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true
    }),
<<<<<<< HEAD
=======
    UserModule,
    AuthModule
>>>>>>> users
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
