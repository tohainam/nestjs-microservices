import { SetMetadata } from '@nestjs/common';

export const TRANSACTION_KEY = 'transaction';

export interface TransactionMetadata {
  required: boolean;
  isolationLevel?: 'readUncommitted' | 'readCommitted' | 'repeatableRead' | 'serializable';
  timeout?: number;
}

export const Transaction = (metadata?: Partial<TransactionMetadata>) =>
  SetMetadata(TRANSACTION_KEY, {
    required: true,
    isolationLevel: 'readCommitted',
    timeout: 30000, // 30 seconds default
    ...metadata,
  });

export const NoTransaction = () => SetMetadata(TRANSACTION_KEY, { required: false });