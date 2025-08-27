import { Injectable, Logger } from '@nestjs/common';
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { BaseService } from '../services/base.service';
import { TransactionContext, getTransactionSession } from '../utils/transaction.utils';

@Injectable()
export abstract class BaseRepository<T extends Document> extends BaseService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly model: Model<T>,
  ) {
    super();
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, context?: TransactionContext): Promise<T> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const document = new this.model(data);
      const saved = await document.save(options);
      this.logger.debug('Document created successfully', { id: saved._id });
      return saved;
    } catch (error) {
      this.logger.error('Failed to create document', error);
      throw error;
    }
  }

  /**
   * Create multiple documents
   */
  async createMany(data: Partial<T>[], context?: TransactionContext): Promise<T[]> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const documents = await this.model.insertMany(data, options);
      this.logger.debug('Multiple documents created successfully', { count: documents.length });
      return documents;
    } catch (error) {
      this.logger.error('Failed to create multiple documents', error);
      throw error;
    }
  }

  /**
   * Find a document by ID
   */
  async findById(id: string, context?: TransactionContext): Promise<T | null> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const document = await this.model.findById(id, null, options);
      return document;
    } catch (error) {
      this.logger.error('Failed to find document by ID', { id, error });
      throw error;
    }
  }

  /**
   * Find documents by filter
   */
  async find(filter: FilterQuery<T>, context?: TransactionContext): Promise<T[]> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const documents = await this.model.find(filter, null, options);
      return documents;
    } catch (error) {
      this.logger.error('Failed to find documents', { filter, error });
      throw error;
    }
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: FilterQuery<T>, context?: TransactionContext): Promise<T | null> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const document = await this.model.findOne(filter, null, options);
      return document;
    } catch (error) {
      this.logger.error('Failed to find one document', { filter, error });
      throw error;
    }
  }

  /**
   * Update a document by ID
   */
  async updateById(
    id: string,
    update: UpdateQuery<T>,
    context?: TransactionContext,
  ): Promise<T | null> {
    const session = getTransactionSession(context);
    const options = session ? { session, new: true } : { new: true };
    
    try {
      const document = await this.model.findByIdAndUpdate(id, update, options);
      if (document) {
        this.logger.debug('Document updated successfully', { id });
      }
      return document;
    } catch (error) {
      this.logger.error('Failed to update document by ID', { id, error });
      throw error;
    }
  }

  /**
   * Update documents by filter
   */
  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    context?: TransactionContext,
  ): Promise<number> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const result = await this.model.updateMany(filter, update, options);
      this.logger.debug('Multiple documents updated successfully', { 
        matched: result.matchedCount,
        modified: result.modifiedCount 
      });
      return result.modifiedCount;
    } catch (error) {
      this.logger.error('Failed to update multiple documents', { filter, error });
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  async deleteById(id: string, context?: TransactionContext): Promise<boolean> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const result = await this.model.findByIdAndDelete(id, options);
      const deleted = !!result;
      if (deleted) {
        this.logger.debug('Document deleted successfully', { id });
      }
      return deleted;
    } catch (error) {
      this.logger.error('Failed to delete document by ID', { id, error });
      throw error;
    }
  }

  /**
   * Delete documents by filter
   */
  async deleteMany(filter: FilterQuery<T>, context?: TransactionContext): Promise<number> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const result = await this.model.deleteMany(filter, options);
      this.logger.debug('Multiple documents deleted successfully', { count: result.deletedCount });
      return result.deletedCount;
    } catch (error) {
      this.logger.error('Failed to delete multiple documents', { filter, error });
      throw error;
    }
  }

  /**
   * Count documents by filter
   */
  async count(filter: FilterQuery<T>, context?: TransactionContext): Promise<number> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const count = await this.model.countDocuments(filter, options);
      return count;
    } catch (error) {
      this.logger.error('Failed to count documents', { filter, error });
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter: FilterQuery<T>, context?: TransactionContext): Promise<boolean> {
    const session = getTransactionSession(context);
    const options = session ? { session } : {};
    
    try {
      const exists = await this.model.exists(filter, options);
      return !!exists;
    } catch (error) {
      this.logger.error('Failed to check document existence', { filter, error });
      throw error;
    }
  }
}