import { Request } from 'express';
import { ClientSession } from 'mongoose';

export interface TransactionContext {
  session?: ClientSession;
  request?: Request;
}

export function getTransactionSession(context?: TransactionContext): ClientSession | undefined {
  if (context?.session) {
    return context.session;
  }
  
  if (context?.request?.transactionSession) {
    return context.request.transactionSession;
  }
  
  return undefined;
}

export function createTransactionContext(
  session?: ClientSession,
  request?: Request,
): TransactionContext {
  return { session, request };
}

export function mergeTransactionContexts(
  ...contexts: (TransactionContext | undefined)[]
): TransactionContext {
  const merged: TransactionContext = {};
  
  for (const context of contexts) {
    if (context?.session) {
      merged.session = context.session;
    }
    if (context?.request) {
      merged.request = context.request;
    }
  }
  
  return merged;
}

export function isInTransaction(context?: TransactionContext): boolean {
  return !!getTransactionSession(context);
}