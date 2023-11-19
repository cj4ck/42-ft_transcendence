import { Test, TestingModule } from '@nestjs/testing';
import { UserGatewayGateway } from './user-gateway.gateway';

describe('UserGatewayGateway', () => {
  let gateway: UserGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGatewayGateway],
    }).compile();

    gateway = module.get<UserGatewayGateway>(UserGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
