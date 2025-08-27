import { Injectable } from '@nestjs/common';
import { Result, resultOk, resultErr } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    authUserId: string,
    firstName: string,
    lastName: string,
  ): Promise<Result<User>> {
    try {
      const user = new this.userModel({
        authUserId,
        firstName,
        lastName,
        isActive: true,
        isEmailVerified: false,
      });
      const saved = await user.save();
      return resultOk(saved);
    } catch (error) {
      return resultErr([`Failed to create user: ${getErrorMessage(error)}`]);
    }
  }

  async getUserByAuthUserId(authUserId: string): Promise<Result<User>> {
    try {
      const user = await this.userModel.findOne({ authUserId });
      if (!user) {
        return resultErr([`User with authUserId ${authUserId} not found`]);
      }
      return resultOk(user);
    } catch (error) {
      return resultErr([`Failed to get user: ${getErrorMessage(error)}`]);
    }
  }

  async updateUserProfile(
    authUserId: string,
    updateData: Partial<User>,
  ): Promise<Result<User>> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { authUserId },
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!user) {
        return resultErr([`User with authUserId ${authUserId} not found`]);
      }
      return resultOk(user);
    } catch (error) {
      return resultErr([
        `Failed to update user profile: ${getErrorMessage(error)}`,
      ]);
    }
  }

  async deleteUser(authUserId: string): Promise<Result<boolean>> {
    try {
      const result = await this.userModel.deleteOne({ authUserId });
      return resultOk(result.deletedCount > 0);
    } catch (error) {
      return resultErr([`Failed to delete user: ${getErrorMessage(error)}`]);
    }
  }

  async deactivateUser(authUserId: string): Promise<Result<User>> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { authUserId },
        { $set: { isActive: false } },
        { new: true },
      );

      if (!user) {
        return resultErr([`User with authUserId ${authUserId} not found`]);
      }
      return resultOk(user);
    } catch (error) {
      return resultErr([
        `Failed to deactivate user: ${getErrorMessage(error)}`,
      ]);
    }
  }

  async activateUser(authUserId: string): Promise<Result<User>> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { authUserId },
        { $set: { isActive: true } },
        { new: true },
      );

      if (!user) {
        return resultErr([`User with authUserId ${authUserId} not found`]);
      }
      return resultOk(user);
    } catch (error) {
      return resultErr([`Failed to activate user: ${getErrorMessage(error)}`]);
    }
  }

  async updateLastLogin(authUserId: string): Promise<Result<void>> {
    try {
      await this.userModel.updateOne(
        { authUserId },
        { $set: { lastLoginAt: new Date() } },
      );
      return resultOk<void>(undefined as unknown as void);
    } catch (error) {
      return resultErr([
        `Failed to update last login: ${getErrorMessage(error)}`,
      ]);
    }
  }

  async searchUsers(
    query: string,
    limit: number = 10,
  ): Promise<Result<User[]>> {
    try {
      const users = await this.userModel
        .find({
          $and: [
            { isActive: true },
            {
              $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
              ],
            },
          ],
        })
        .limit(limit);
      return resultOk(users);
    } catch (error) {
      return resultErr([`Failed to search users: ${getErrorMessage(error)}`]);
    }
  }

  async getUsersByAuthUserIds(authUserIds: string[]): Promise<Result<User[]>> {
    try {
      const users = await this.userModel.find({
        authUserId: { $in: authUserIds },
        isActive: true,
      });
      return resultOk(users);
    } catch (error) {
      return resultErr([
        `Failed to get users by authUserIds: ${getErrorMessage(error)}`,
      ]);
    }
  }
}
