import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../src/services/user.service';
import { User } from '../src/entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: jest.MockedFunction<any>;

  beforeEach(async () => {
    const mockUser = {
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        authUserId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
      }),
    };

    mockUserModel = jest.fn().mockImplementation(() => mockUser);
    mockUserModel.findOne = jest.fn();
    mockUserModel.findOneAndUpdate = jest.fn();
    mockUserModel.deleteOne = jest.fn();
    mockUserModel.updateOne = jest.fn();
    mockUserModel.find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
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
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.getUserByAuthUserId('non-existent-id'),
      ).rejects.toThrow();
    });
  });
});
