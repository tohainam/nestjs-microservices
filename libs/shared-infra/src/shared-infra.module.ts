import { Module } from '@nestjs/common';
import { SharedInfraService } from './shared-infra.service';

@Module({
  providers: [SharedInfraService],
  exports: [SharedInfraService],
})
export class SharedInfraModule {}
