import { Module } from '@nestjs/common';
import { TransactionModule } from '@app/shared-infra';
import { BaseService, BaseRepository, Transaction } from '@app/common';
import { AbstractDocument } from '@app/shared-infra';

// Example User Entity
class User extends AbstractDocument {
  email: string;
  name: string;
  createdAt: Date;
}

// Example User Repository
class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string, context?: any): Promise<User | null> {
    const session = this.getCurrentSession(context);
    const options = session ? { session } : {};
    
    return this.model.findOne({ email }, null, options);
  }
}

// Example User Service
class UserService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  // Simple transaction using decorator
  @Transaction()
  async createUserWithValidation(userData: any): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await this.userRepository.create(userData);
    
    // Send welcome email (this would be in the same transaction)
    await this.sendWelcomeEmail(user.email);
    
    return user;
  }

  // Manual transaction control
  async createUserWithProfile(userData: any, profileData: any): Promise<any> {
    return this.executeInTransaction(async (session) => {
      const context = { session };
      
      // Create user
      const user = await this.userRepository.create(userData, context);
      
      // Create profile in the same transaction
      const profile = await this.profileRepository.create({
        ...profileData,
        userId: user._id,
      }, context);
      
      return { user, profile };
    });
  }

  // Transaction with rollback
  async createUserWithRollback(userData: any): Promise<User> {
    const operations = [
      async (session: any) => {
        const context = { session };
        return this.userRepository.create(userData, context);
      }
    ];

    const rollbackOperations = [
      async (session: any) => {
        const context = { session };
        // Rollback: delete the created user
        await this.userRepository.deleteById(userData.id, context);
      }
    ];

    const result = await this.executeWithRollback(operations, rollbackOperations);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data[0];
  }

  private async sendWelcomeEmail(email: string): Promise<void> {
    // Simulate sending welcome email
    console.log(`Sending welcome email to ${email}`);
  }
}

// Example Module Configuration
@Module({
  imports: [
    TransactionModule, // Import the transaction module
    // ... other imports
  ],
  providers: [
    UserService,
    UserRepository,
    // ... other providers
  ],
  exports: [UserService],
})
export class UserModule {}

// Example Controller
class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(req: any, userData: any) {
    try {
      // The @Transaction decorator will automatically handle the transaction
      const user = await this.userService.createUserWithValidation(userData);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createUserWithProfile(req: any, userData: any, profileData: any) {
    try {
      const result = await this.userService.createUserWithProfile(userData, profileData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Example of how to use in a real service
export class TransactionIntegrationExample {
  static demonstrateUsage() {
    console.log(`
Transaction System Integration Example:

1. Import TransactionModule in your service module
2. Extend BaseService or BaseRepository in your services/repositories
3. Use @Transaction decorator for simple cases
4. Use manual transaction control for complex scenarios
5. Implement rollback logic when needed

The system automatically handles:
- Transaction lifecycle (start, commit, abort, end)
- Session management
- Error handling and rollback
- Nested transaction support
- MongoDB integration
    `);
  }
}