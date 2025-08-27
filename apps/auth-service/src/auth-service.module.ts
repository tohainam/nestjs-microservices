import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { ConfigModule } from '@nestjs/config';
import { MongoDatabaseModule } from '@app/shared-infra';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongoDatabaseModule,
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
