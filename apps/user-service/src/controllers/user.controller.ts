import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserServiceControllerMethods } from '@app/common';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByUserIdRequest,
  GetUserByUserIdResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  ActivateUserRequest,
  ActivateUserResponse,
  DeactivateUserRequest,
  DeactivateUserResponse,
  UpdateLastLoginRequest,
  UpdateLastLoginResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  GetUsersByIdsRequest,
  GetUsersByIdsResponse,
  HealthRequest,
  HealthResponse,
} from '@app/common';

@Controller()
@UserServiceControllerMethods()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const user = await this.userService.createUser(
        request.userId,
        request.firstName,
        request.lastName
      );

      return {
        success: true,
        message: 'User profile created successfully',
        user: this.mapToUserProfile(user),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create user profile',
        user: null,
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async getUserByUserId(request: GetUserByUserIdRequest): Promise<GetUserByUserIdResponse> {
    try {
      const user = await this.userService.getUserByUserId(request.userId);

      return {
        success: true,
        message: 'User profile retrieved successfully',
        user: this.mapToUserProfile(user),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user profile',
        user: null,
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async updateUserProfile(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
    try {
      const user = await this.userService.updateUserProfile(request.userId, request);

      return {
        success: true,
        message: 'User profile updated successfully',
        user: this.mapToUserProfile(user),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update user profile',
        user: null,
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    try {
      const deleted = await this.userService.deleteUser(request.userId);

      return {
        success: deleted,
        message: deleted ? 'User profile deleted successfully' : 'User profile not found',
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete user profile',
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async activateUser(request: ActivateUserRequest): Promise<ActivateUserResponse> {
    try {
      const user = await this.userService.activateUser(request.userId);

      return {
        success: true,
        message: 'User activated successfully',
        user: this.mapToUserProfile(user),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to activate user',
        user: null,
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async deactivateUser(request: DeactivateUserRequest): Promise<DeactivateUserResponse> {
    try {
      const user = await this.userService.deactivateUser(request.userId);

      return {
        success: true,
        message: 'User deactivated successfully',
        user: this.mapToUserProfile(user),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to deactivate user',
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async updateLastLogin(request: UpdateLastLoginRequest): Promise<UpdateLastLoginResponse> {
    try {
      await this.userService.updateLastLogin(request.userId);

      return {
        success: true,
        message: 'Last login updated successfully',
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update last login',
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    try {
      const users = await this.userService.searchUsers(request.query, request.limit);

      return {
        success: true,
        message: 'Users found successfully',
        users: users.map(user => this.mapToUserProfile(user)),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to search users',
        users: [],
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async getUsersByIds(request: GetUsersByIdsRequest): Promise<GetUsersByIdsResponse> {
    try {
      const users = await this.userService.getUsersByIds(request.userIds);

      return {
        success: true,
        message: 'Users retrieved successfully',
        users: users.map(user => this.mapToUserProfile(user)),
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve users',
        users: [],
        errors: [error.message || 'Unknown error'],
      };
    }
  }

  async health(request: HealthRequest): Promise<HealthResponse> {
    return {
      message: 'User service is healthy',
    };
  }

  private mapToUserProfile(user: any) {
    if (!user) return null;

    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      profilePicture: user.profilePicture,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth?.toISOString(),
      phoneNumber: user.phoneNumber,
      address: user.address,
      preferences: user.preferences,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }
}