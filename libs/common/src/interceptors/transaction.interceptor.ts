import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TRANSACTION_KEY, TransactionMetadata } from '../decorators/transaction.decorator';
import { TransactionManager } from '../types/transaction.types';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject('TRANSACTION_MANAGER') private readonly transactionManager: TransactionManager,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const transactionMetadata = this.reflector.get<TransactionMetadata>(
      TRANSACTION_KEY,
      context.getHandler(),
    );

    // If no transaction is required, proceed normally
    if (!transactionMetadata?.required) {
      return next.handle();
    }

    this.logger.debug('Starting transaction for method', {
      method: context.getHandler().name,
      metadata: transactionMetadata,
    });

    // Execute with transaction
    const result = await this.transactionManager.withTransaction(async (session) => {
      // Store session in request for use in services
      const request = context.switchToHttp().getRequest();
      request.transactionSession = session;

      // Execute the handler
      return new Promise((resolve, reject) => {
        next.handle().subscribe({
          next: (data) => resolve(data),
          error: (error) => reject(error),
        });
      });
    });

    if (!result.success) {
      this.logger.error('Transaction failed', result.error);
      return throwError(() => result.error);
    }

    this.logger.debug('Transaction completed successfully');
    return next.handle();
  }
}