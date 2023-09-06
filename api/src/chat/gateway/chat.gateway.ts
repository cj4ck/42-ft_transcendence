import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000'] } })

export class ChatGateway {

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
