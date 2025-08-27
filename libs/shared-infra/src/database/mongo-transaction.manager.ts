import { Injectable, Logger } from '@nestjs/common';
import { Connection, ClientSession, ReadPreference, ReadConcern, WriteConcern } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import {
  TransactionManager,
  TransactionResult,
  TransactionCallback,
  TransactionOptions,
  DatabaseTransaction,
} from '@app/common';

@Injectable()
export class MongoTransactionManager implements TransactionManager {
  private readonly logger = new Logger(MongoTransactionManager.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startTransaction(): Promise<ClientSession> {
    try {
      const session = await this.connection.startSession();
      await session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      });
      this.logger.debug('Transaction started');
      return session;
    } catch (error) {
      this.logger.error('Failed to start transaction', error);
      throw error;
    }
  }

  async commitTransaction(session: ClientSession): Promise<void> {
    try {
      await session.commitTransaction();
      this.logger.debug('Transaction committed');
    } catch (error) {
      this.logger.error('Failed to commit transaction', error);
      throw error;
    }
  }

  async abortTransaction(session: ClientSession): Promise<void> {
    try {
      await session.abortTransaction();
      this.logger.debug('Transaction aborted');
    } catch (error) {
      this.logger.error('Failed to abort transaction', error);
      throw error;
    }
  }

  async endSession(session: ClientSession): Promise<void> {
    try {
      await session.endSession();
      this.logger.debug('Session ended');
    } catch (error) {
      this.logger.error('Failed to end session', error);
      throw error;
    }
  }

  async withTransaction<T>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {}
  ): Promise<TransactionResult<T>> {
    let session: ClientSession | undefined;

    try {
      // Start transaction
      session = await this.startTransaction();

      // Execute callback with session
      const result = await callback(session);

      // Commit transaction
      await this.commitTransaction(session);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Transaction failed', error);

      // Abort transaction if session exists
      if (session) {
        try {
          await this.abortTransaction(session);
        } catch (abortError) {
          this.logger.error('Failed to abort transaction', abortError);
        }
      }

      return {
        success: false,
        error: error as Error,
      };
    } finally {
      // End session if it exists
      if (session) {
        try {
          await this.endSession(session);
        } catch (endError) {
          this.logger.error('Failed to end session', endError);
        }
      }
    }
  }

  createTransaction(): DatabaseTransaction {
    return new MongoTransaction(this.connection);
  }
}

class MongoTransaction implements DatabaseTransaction {
  public session: ClientSession;
  private readonly logger = new Logger(MongoTransaction.name);

  constructor(private readonly connection: Connection) {}

  async startTransaction(): Promise<void> {
    try {
      this.session = await this.connection.startSession();
      await this.session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      });
      this.logger.debug('Transaction started');
    } catch (error) {
      this.logger.error('Failed to start transaction', error);
      throw error;
    }
  }

  async commitTransaction(): Promise<void> {
    try {
      await this.session.commitTransaction();
      this.logger.debug('Transaction committed');
    } catch (error) {
      this.logger.error('Failed to commit transaction', error);
      throw error;
    }
  }

  async abortTransaction(): Promise<void> {
    try {
      await this.session.abortTransaction();
      this.logger.debug('Transaction aborted');
    } catch (error) {
      this.logger.error('Failed to abort transaction', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    try {
      await this.session.endSession();
      this.logger.debug('Session ended');
    } catch (error) {
      this.logger.error('Failed to end session', error);
      throw error;
    }
  }
}