import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

// Helper function to safely convert MongoDB ObjectId to string
function safeObjectIdToString(id: unknown): string {
  if (id instanceof Types.ObjectId) {
    return id.toString();
  }
  if (typeof id === 'string') {
    return id;
  }
  return '';
}

// Helper function to safely extract timestamps from MongoDB document
function extractTimestamps(doc: UserDocument): {
  createdAt: string;
  updatedAt: string;
} {
  const now = new Date().toISOString();

  // Type-safe access to timestamps
  const docWithTimestamps = doc as UserDocument & {
    createdAt?: Date;
    updatedAt?: Date;
  };

  return {
    createdAt: docWithTimestamps.createdAt?.toISOString() ?? now,
    updatedAt: docWithTimestamps.updatedAt?.toISOString() ?? now,
  };
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(authUserId: string, firstName: string, lastName: string): Promise<User> {
    try {
      const user = new this.userModel({
        authUserId,
        firstName,
        lastName,
        isActive: true,
        isEmailVerified: false,
      });

      return await user.save();
    } catch (error) {
      throw new Error(`Failed to create user: ${getErrorMessage(error)}`);
    }
  }

  async getUserByAuthUserId(authUserId: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ authUserId });
      if (!user) {
        throw new NotFoundException(`User with authUserId ${authUserId} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to get user: ${getErrorMessage(error)}`);
    }
  }

  async updateUserProfile(authUserId: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { authUserId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundException(`User with authUserId ${authUserId} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update user profile: ${getErrorMessage(error)}`);
    }
  }

  async deleteUser(authUserId: string): Promise<boolean> {
    try {
      const result = await this.userModel.deleteOne({ authUserId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${getErrorMessage(error)}`);
    }
  }

  async deactivateUser(authUserId: string): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { authUserId },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!user) {
        throw new NotFoundException(`User with authUserId ${authUserId} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to deactivate user: ${getErrorMessage(error)}`);
    }
  }

  async activateUser(authUserId: string): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { authUserId },
        { $set: { isActive: true } },
        { new: true }
      );

      if (!user) {
        throw new NotFoundException(`User with authUserId ${authUserId} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to activate user: ${getErrorMessage(error)}`);
    }
  }

  async updateLastLogin(authUserId: string): Promise<void> {
    try {
      await this.userModel.updateOne(
        { authUserId },
        { $set: { lastLoginAt: new Date() } }
      );
    } catch (error) {
      // Log error but don't throw as this is not critical
      console.error(`Failed to update last login: ${getErrorMessage(error)}`);
    }
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const users = await this.userModel.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      }).limit(limit);

      return users;
    } catch (error) {
      throw new Error(`Failed to search users: ${getErrorMessage(error)}`);
    }
  }

  async getUsersByAuthUserIds(authUserIds: string[]): Promise<User[]> {
    try {
      const users = await this.userModel.find({
        authUserId: { $in: authUserIds },
        isActive: true,
      });

      return users;
    } catch (error) {
      throw new Error(`Failed to get users by authUserIds: ${getErrorMessage(error)}`);
    }
  }
}