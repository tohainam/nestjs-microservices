import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME } from '@app/common';
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
        name: AUTH_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/auth.proto'),
            url: configService.getOrThrow('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController, HealthController],
  providers: [AuthClientService],
})
export class ApiGatewayModule { }
