import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/model/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [ChatGateway]
})
export class ChatModule {}
