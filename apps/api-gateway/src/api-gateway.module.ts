import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  USER_PACKAGE_NAME,
} from '@app/common';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';
import { AuthClientService } from './services/auth-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
      expandVariables: true,
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME as string,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME as string,
            protoPath: join(process.cwd(), 'proto/auth.proto'),
            url: configService.getOrThrow<string>('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: USER_PACKAGE_NAME as string,
            protoPath: join(process.cwd(), 'proto/user.proto'),
            url: configService.getOrThrow<string>('USER_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController, HealthController],
  providers: [AuthClientService],
})
export class ApiGatewayModule {}
