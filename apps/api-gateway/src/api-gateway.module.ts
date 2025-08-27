import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';
import { AuthClientService } from './services/auth-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../../../proto/auth.proto'),
          url: process.env.AUTH_GRPC_URL || 'localhost:5000',
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, AuthController, HealthController],
  providers: [ApiGatewayService, AuthClientService],
})
export class ApiGatewayModule {}
