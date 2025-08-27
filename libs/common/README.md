# Transaction System

This library provides a comprehensive transaction system that can be reused across multiple services in a NestJS microservices architecture.

## Features

- **Automatic Transaction Management**: Handle transactions with decorators
- **Manual Transaction Control**: Full control over transaction lifecycle
- **Rollback Support**: Automatic rollback on failures
- **Nested Transaction Support**: Handle complex transaction scenarios
- **MongoDB Integration**: Built-in support for MongoDB transactions
- **Reusable Components**: Can be imported by any service

## Installation

The transaction system is part of the `@app/common` and `@app/shared-infra` libraries.

## Quick Start

### 1. Import Transaction Module

```typescript
import { TransactionModule } from '@app/shared-infra';

@Module({
  imports: [
    TransactionModule,
    // ... other imports
  ],
})
export class YourServiceModule {}
```

### 2. Use Transaction Decorator

```typescript
import { Transaction } from '@app/common';

@Injectable()
export class UserService extends BaseService {
  @Transaction()
  async createUserWithProfile(userData: any, profileData: any): Promise<any> {
    // This method automatically runs in a transaction
    const user = await this.userRepository.create(userData);
    const profile = await this.profileRepository.create(profileData, user.id);
    return { user, profile };
  }
}
```

### 3. Manual Transaction Control

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from '@app/common';

@Injectable()
export class UserService extends BaseService {
  async createUserWithProfile(userData: any, profileData: any): Promise<any> {
    return this.executeInTransaction(async (session) => {
      const context = { session };
      
      const user = await this.userRepository.create(userData, context);
      const profile = await this.profileRepository.create(profileData, user.id, context);
      
      return { user, profile };
    });
  }
}
```

## Core Components

### TransactionManager

The main interface for transaction operations:

```typescript
interface TransactionManager {
  startTransaction(): Promise<any>;
  commitTransaction(session: any): Promise<void>;
  abortTransaction(session: any): Promise<void>;
  endSession(session: any): Promise<void>;
  withTransaction<T>(
    callback: TransactionCallback<T>,
    options?: TransactionOptions
  ): Promise<TransactionResult<T>>;
}
```

### BaseService

Extend this class to get transaction capabilities:

```typescript
export abstract class BaseService {
  protected executeInTransaction<T>(
    callback: TransactionCallback<T>,
    req?: Request
  ): Promise<TransactionResult<T>>;
  
  protected executeMultipleInTransaction<T>(
    operations: TransactionCallback<T>[],
    req?: Request
  ): Promise<TransactionResult<T[]>>;
  
  protected executeWithRollback<T>(
    operations: TransactionCallback<T>[],
    rollbackOperations: TransactionCallback<void>[],
    req?: Request
  ): Promise<TransactionResult<T[]>>;
}
```

### BaseRepository

Extend this class for transaction-aware CRUD operations:

```typescript
export abstract class BaseRepository<T extends Document> extends BaseService {
  async create(data: Partial<T>, context?: TransactionContext): Promise<T>;
  async findById(id: string, context?: TransactionContext): Promise<T | null>;
  async updateById(id: string, update: UpdateQuery<T>, context?: TransactionContext): Promise<T | null>;
  async deleteById(id: string, context?: TransactionContext): Promise<boolean>;
  // ... more methods
}
```

## Usage Patterns

### Pattern 1: Simple Transaction with Decorator

```typescript
@Transaction()
async createUserWithProfile(userData: any, profileData: any): Promise<any> {
  const user = await this.userRepository.create(userData);
  const profile = await this.profileRepository.create(profileData, user.id);
  return { user, profile };
}
```

### Pattern 2: Manual Transaction with Rollback

```typescript
async createUserWithRollback(userData: any, profileData: any): Promise<any> {
  const operations = [
    async (session: any) => this.userRepository.create(userData, { session }),
    async (session: any) => this.profileRepository.create(profileData, { session })
  ];

  const rollbackOperations = [
    async (session: any) => this.userRepository.deleteById(userData.id, { session }),
    async (session: any) => this.profileRepository.deleteById(profileData.id, { session })
  ];

  return this.executeWithRollback(operations, rollbackOperations);
}
```

### Pattern 3: Multiple Operations in Transaction

```typescript
async createMultipleUsers(usersData: any[]): Promise<any[]> {
  return this.executeMultipleInTransaction(
    usersData.map(userData => async (session) => {
      return this.userRepository.create(userData, { session });
    })
  );
}
```

### Pattern 4: Nested Transaction Handling

```typescript
async createUserWithNestedOperations(userData: any): Promise<any> {
  return this.executeInTransaction(async (session) => {
    const context = { session };
    
    const user = await this.userRepository.create(userData, context);
    const preferences = await this.preferencesRepository.create(user.id, context);
    const settings = await this.settingsRepository.create(user.id, context);
    
    return { user, preferences, settings };
  });
}
```

## Transaction Context

The `TransactionContext` interface provides a way to pass transaction information:

```typescript
interface TransactionContext {
  session?: ClientSession;
  request?: Request;
}
```

### Creating Context

```typescript
import { createTransactionContext } from '@app/common';

const context = createTransactionContext(session, request);
```

### Using Context in Repositories

```typescript
async createUser(userData: any, context?: TransactionContext): Promise<User> {
  const session = getTransactionSession(context);
  const options = session ? { session } : {};
  
  const user = new this.model(userData);
  return user.save(options);
}
```

## Error Handling

The transaction system automatically handles errors and rollbacks:

```typescript
try {
  const result = await this.executeInTransaction(async (session) => {
    // Your operations here
  });
  
  if (result.success) {
    return result.data;
  } else {
    throw result.error;
  }
} catch (error) {
  // Handle error
}
```

## Configuration

### Transaction Options

```typescript
@Transaction({
  isolationLevel: 'readCommitted',
  timeout: 30000
})
async method() {}
```

### MongoDB Transaction Options

```typescript
const session = await this.connection.startSession();
await session.startTransaction({
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
});
```

## Best Practices

1. **Use Decorators for Simple Cases**: Use `@Transaction()` for straightforward transaction needs
2. **Manual Control for Complex Scenarios**: Use manual transaction control for complex business logic
3. **Always Handle Errors**: Implement proper error handling and rollback logic
4. **Keep Transactions Short**: Minimize the time transactions are open
5. **Use Context Consistently**: Pass transaction context through all repository calls
6. **Test Transaction Scenarios**: Ensure your tests cover transaction success and failure cases

## Testing

### Unit Testing with Transactions

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockTransactionManager: jest.Mocked<TransactionManager>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'TRANSACTION_MANAGER',
          useValue: mockTransactionManager,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should create user with profile in transaction', async () => {
    mockTransactionManager.withTransaction.mockResolvedValue({
      success: true,
      data: { user: mockUser, profile: mockProfile },
    });

    const result = await service.createUserWithProfile(userData, profileData);
    expect(result).toEqual({ user: mockUser, profile: mockProfile });
  });
});
```

## Migration Guide

### From Manual Transaction Management

**Before:**
```typescript
const session = await this.connection.startSession();
try {
  await session.startTransaction();
  // ... operations
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  await session.endSession();
}
```

**After:**
```typescript
@Transaction()
async method() {
  // ... operations
}
```

### From Repository Pattern

**Before:**
```typescript
async createUser(userData: any): Promise<User> {
  const user = new this.model(userData);
  return user.save();
}
```

**After:**
```typescript
async createUser(userData: any, context?: TransactionContext): Promise<User> {
  const session = getTransactionSession(context);
  const options = session ? { session } : {};
  
  const user = new this.model(userData);
  return user.save(options);
}
```

## Troubleshooting

### Common Issues

1. **Transaction Not Starting**: Ensure `TransactionModule` is imported
2. **Session Not Available**: Check that you're using the correct context
3. **Rollback Not Working**: Verify rollback operations are properly implemented
4. **Performance Issues**: Consider transaction timeout and isolation levels

### Debug Mode

Enable debug logging to troubleshoot transaction issues:

```typescript
// In your environment configuration
LOG_LEVEL=debug
```

## Contributing

When adding new transaction features:

1. Follow the existing patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure backward compatibility
5. Add proper error handling