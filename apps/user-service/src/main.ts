import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { USER_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const configService = app.get(ConfigService);

  // Configure gRPC microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: USER_PACKAGE_NAME as string,
      protoPath: join(process.cwd(), 'proto/user.proto'),
      url: configService.getOrThrow<string>('USER_GRPC_URL'),
    },
  });

  await app.startAllMicroservices();
  console.log('User Service gRPC microservice started');
}
void bootstrap();
