import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../services/base.service';
import { Transaction } from '../decorators/transaction.decorator';
import { TransactionContext, createTransactionContext } from '../utils/transaction.utils';

@Injectable()
export class TransactionExampleService extends BaseService {
  private readonly logger = new Logger(TransactionExampleService.name);

  /**
   * Example 1: Simple transaction using decorator
   */
  @Transaction()
  async createUserWithProfile(userData: any, profileData: any): Promise<any> {
    // This method will automatically run in a transaction
    // The transaction session is available in the request context
    
    // Simulate creating user and profile
    const user = await this.createUser(userData);
    const profile = await this.createProfile(profileData, user.id);
    
    return { user, profile };
  }

  /**
   * Example 2: Manual transaction control
   */
  async createUserWithProfileManual(userData: any, profileData: any): Promise<any> {
    return this.executeInTransaction(async (session) => {
      const context = createTransactionContext(session);
      
      const user = await this.createUser(userData, context);
      const profile = await this.createProfile(profileData, user.id, context);
      
      return { user, profile };
    });
  }

  /**
   * Example 3: Multiple operations in transaction
   */
  async createMultipleUsers(usersData: any[]): Promise<any[]> {
    return this.executeMultipleInTransaction(
      usersData.map(userData => async (session) => {
        const context = createTransactionContext(session);
        return this.createUser(userData, context);
      })
    );
  }

  /**
   * Example 4: Transaction with rollback
   */
  async createUserWithRollback(userData: any, profileData: any): Promise<any> {
    const operations = [
      async (session: any) => {
        const context = createTransactionContext(session);
        return this.createUser(userData, context);
      },
      async (session: any) => {
        const context = createTransactionContext(session);
        return this.createProfile(profileData, userData.id, context);
      }
    ];

    const rollbackOperations = [
      async (session: any) => {
        const context = createTransactionContext(session);
        await this.deleteUser(userData.id, context);
      },
      async (session: any) => {
        const context = createTransactionContext(session);
        await this.deleteProfile(profileData.id, context);
      }
    ];

    return this.executeWithRollback(operations, rollbackOperations);
  }

  /**
   * Example 5: Nested transaction handling
   */
  async createUserWithNestedOperations(userData: any): Promise<any> {
    return this.executeInTransaction(async (session) => {
      const context = createTransactionContext(session);
      
      // Create user
      const user = await this.createUser(userData, context);
      
      // Create related entities in the same transaction
      const preferences = await this.createUserPreferences(user.id, context);
      const settings = await this.createUserSettings(user.id, context);
      
      return { user, preferences, settings };
    });
  }

  // Helper methods (these would typically be repository calls)
  private async createUser(userData: any, context?: TransactionContext): Promise<any> {
    this.logger.debug('Creating user', { userData });
    // Simulate user creation
    return { id: 'user-123', ...userData };
  }

  private async createProfile(profileData: any, userId: string, context?: TransactionContext): Promise<any> {
    this.logger.debug('Creating profile', { profileData, userId });
    // Simulate profile creation
    return { id: 'profile-123', userId, ...profileData };
  }

  private async createUserPreferences(userId: string, context?: TransactionContext): Promise<any> {
    this.logger.debug('Creating user preferences', { userId });
    // Simulate preferences creation
    return { id: 'prefs-123', userId, theme: 'dark' };
  }

  private async createUserSettings(userId: string, context?: TransactionContext): Promise<any> {
    this.logger.debug('Creating user settings', { userId });
    // Simulate settings creation
    return { id: 'settings-123', userId, notifications: true };
  }

  private async deleteUser(userId: string, context?: TransactionContext): Promise<void> {
    this.logger.debug('Deleting user', { userId });
    // Simulate user deletion
  }

  private async deleteProfile(profileId: string, context?: TransactionContext): Promise<void> {
    this.logger.debug('Deleting profile', { profileId });
    // Simulate profile deletion
  }
}