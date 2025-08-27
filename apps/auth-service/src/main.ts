import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  const configService = app.get(ConfigService);
  
  // Configure gRPC microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, '../../../proto/auth.proto'),
      url: configService.getOrThrow<string>('AUTH_GRPC_URL'),
    },
  });

  await app.startAllMicroservices();
  console.log('Auth Service gRPC microservice started');
}
void bootstrap();
