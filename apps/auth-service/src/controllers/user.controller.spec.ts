import 'reflect-metadata';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { UserController } from './user.controller';

describe('UserController gRPC mapping', () => {
  const cases: Array<[keyof UserController, string]> = [
    ['register', 'Register'],
    ['login', 'Login'],
    ['validateToken', 'ValidateToken'],
    ['refreshToken', 'RefreshToken'],
  ];

  it.each(cases)('should map %s to RPC %s', (methodName, rpc) => {
    const target = UserController.prototype as Record<string, unknown>;
    const method = target[methodName] as () => unknown;
    const metadata = Reflect.getMetadata(PATTERN_METADATA, method) as Array<{
      service: string;
      rpc: string;
    }>;
    expect(metadata).toBeDefined();
    expect(metadata[0]).toMatchObject({ service: 'AuthService', rpc });
  });
});
