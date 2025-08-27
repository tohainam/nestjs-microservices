import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoTransactionManager } from './mongo-transaction.manager';
import { TransactionInterceptor } from '@app/common';

@Global()
@Module({
  imports: [MongooseModule.forRoot()],
  providers: [
    {
      provide: 'TRANSACTION_MANAGER',
      useClass: MongoTransactionManager,
    },
    TransactionInterceptor,
  ],
  exports: [
    'TRANSACTION_MANAGER',
    TransactionInterceptor,
  ],
})
export class TransactionModule {}