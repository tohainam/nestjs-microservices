import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../src/services/user.service';
import { User } from '../src/entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;

  beforeEach(async () => {
    mockUserModel = {
      new: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn(),
    };

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
      const mockUser = {
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          userId: 'test-user-id',
          firstName: 'John',
          lastName: 'Doe',
        }),
      };

      mockUserModel.new.mockReturnValue(mockUser);

      const result = await service.createUser('test-user-id', 'John', 'Doe');

      expect(mockUserModel.new).toHaveBeenCalledWith({
        userId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: false,
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getUserByUserId', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        userId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByUserId('test-user-id');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.getUserByUserId('non-existent-id')).rejects.toThrow();
    });
  });
});