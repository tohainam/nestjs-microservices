import { Injectable, Logger, Inject } from '@nestjs/common';
import { Request } from 'express';
import { TransactionManager, TransactionCallback, TransactionResult } from '../types/transaction.types';

@Injectable()
export abstract class BaseService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('TRANSACTION_MANAGER') protected readonly transactionManager: TransactionManager,
  ) {}

  /**
   * Get the current transaction session from the request context
   */
  protected getCurrentSession(req?: Request): any {
    return req?.transactionSession;
  }

  /**
   * Execute a callback within a transaction
   */
  protected async executeInTransaction<T>(
    callback: TransactionCallback<T>,
    req?: Request,
  ): Promise<TransactionResult<T>> {
    // If there's already a session in the request, use it
    const currentSession = this.getCurrentSession(req);
    if (currentSession) {
      try {
        const result = await callback(currentSession);
        return { success: true, data: result };
      } catch (error) {
        this.logger.error('Error in existing transaction', error);
        return { success: false, error: error as Error };
      }
    }

    // Otherwise, create a new transaction
    return this.transactionManager.withTransaction(callback);
  }

  /**
   * Execute multiple operations in a single transaction
   */
  protected async executeMultipleInTransaction<T>(
    operations: TransactionCallback<T>[],
    req?: Request,
  ): Promise<TransactionResult<T[]>> {
    return this.executeInTransaction(async (session) => {
      const results: T[] = [];
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }
      return results;
    }, req);
  }

  /**
   * Execute operations with rollback on failure
   */
  protected async executeWithRollback<T>(
    operations: TransactionCallback<T>[],
    rollbackOperations: TransactionCallback<void>[],
    req?: Request,
  ): Promise<TransactionResult<T[]>> {
    return this.executeInTransaction(async (session) => {
      try {
        const results: T[] = [];
        for (const operation of operations) {
          const result = await operation(session);
          results.push(result);
        }
        return results;
      } catch (error) {
        this.logger.error('Operation failed, executing rollback', error);
        
        // Execute rollback operations
        for (const rollbackOp of rollbackOperations) {
          try {
            await rollbackOp(session);
          } catch (rollbackError) {
            this.logger.error('Rollback operation failed', rollbackError);
          }
        }
        
        throw error;
      }
    }, req);
  }
}