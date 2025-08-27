export interface TransactionOptions {
  session?: any;
  readPreference?: string;
  readConcern?: any;
  writeConcern?: any;
}

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
}

export interface TransactionCallback<T = any> {
  (session: any): Promise<T>;
}

export interface TransactionManager {
  startTransaction(): Promise<any>;
  commitTransaction(session: any): Promise<void>;
  abortTransaction(session: any): Promise<void>;
  endSession(session: any): Promise<void>;
  withTransaction<T>(
    callback: TransactionCallback<T>,
    options?: TransactionOptions
  ): Promise<TransactionResult<T>>;
}

export interface DatabaseTransaction {
  session: any;
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  abortTransaction(): Promise<void>;
  endSession(): Promise<void>;
}