import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { UserService } from '../src/services/user.service';
import { User } from '../src/entities/user.entity';
import { isOk } from '@app/common';

describe('UserService', () => {
  let service: UserService;
  type UserModelLike = {
    new (...args: any[]): { save: jest.Mock };
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    deleteOne: jest.Mock;
    updateOne: jest.Mock;
    find: jest.Mock;
  };
  let mockUserModel: jest.Mocked<UserModelLike>;

  beforeEach(async () => {
    const mockUser = {
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        authUserId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
      }),
    };

    const baseFactory = jest.fn().mockImplementation(() => mockUser);
    mockUserModel = Object.assign(baseFactory, {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn(),
    }) as unknown as jest.Mocked<UserModelLike>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel as unknown as Model<User>,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const result = await service.createUser('test-user-id', 'John', 'Doe');

      expect(mockUserModel).toHaveBeenCalledWith({
        authUserId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
      });
      expect(result).toBeDefined();
    });
  });

  describe('getUserByAuthUserId', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        authUserId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByAuthUserId('test-user-id');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        authUserId: 'test-user-id',
      });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value).toEqual(mockUser);
      }
    });

    it('should return error result when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.getUserByAuthUserId('non-existent-id');
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error[0]).toContain('not found');
      }
    });
  });
});
