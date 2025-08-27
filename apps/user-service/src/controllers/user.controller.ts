import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User, UserDocument } from '../entities/user.entity';
import { UserServiceControllerMethods } from '@app/common';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByAuthUserIdRequest,
  GetUserByAuthUserIdResponse,
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
  GetUsersByAuthUserIdsRequest,
  GetUsersByAuthUserIdsResponse,
  HealthResponse,
  UserProfile,
} from '@app/common';

@Controller()
@UserServiceControllerMethods()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const user = await this.userService.createUser(
        request.authUserId,
        request.firstName,
        request.lastName,
      );

      return {
        success: true,
        message: 'User profile created successfully',
        user: this.mapToUserProfileRequired(user),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to create user profile',
        user: null,
        errors: [errorMessage],
      };
    }
  }

  async getUserByAuthUserId(
    request: GetUserByAuthUserIdRequest,
  ): Promise<GetUserByAuthUserIdResponse> {
    try {
      const user = await this.userService.getUserByAuthUserId(
        request.authUserId,
      );

      return {
        success: true,
        message: 'User profile retrieved successfully',
        user: this.mapToUserProfileRequired(user),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to retrieve user profile',
        user: null,
        errors: [errorMessage],
      };
    }
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    try {
      const user = await this.userService.updateUserProfile(
        request.authUserId,
        request,
      );

      return {
        success: true,
        message: 'User profile updated successfully',
        user: this.mapToUserProfileRequired(user),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to update user profile',
        user: null,
        errors: [errorMessage],
      };
    }
  }

  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    try {
      const deleted = await this.userService.deleteUser(request.authUserId);

      return {
        success: deleted,
        message: deleted
          ? 'User profile deleted successfully'
          : 'User profile not found',
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to delete user profile',
        errors: [errorMessage],
      };
    }
  }

  async activateUser(
    request: ActivateUserRequest,
  ): Promise<ActivateUserResponse> {
    try {
      const user = await this.userService.activateUser(request.authUserId);

      return {
        success: true,
        message: 'User activated successfully',
        user: this.mapToUserProfileRequired(user),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to activate user',
        user: null,
        errors: [errorMessage],
      };
    }
  }

  async deactivateUser(
    request: DeactivateUserRequest,
  ): Promise<DeactivateUserResponse> {
    try {
      const user = await this.userService.deactivateUser(request.authUserId);

      return {
        success: true,
        message: 'User deactivated successfully',
        user: this.mapToUserProfileRequired(user),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to deactivate user',
        user: null,
        errors: [errorMessage],
      };
    }
  }

  async updateLastLogin(
    request: UpdateLastLoginRequest,
  ): Promise<UpdateLastLoginResponse> {
    try {
      await this.userService.updateLastLogin(request.authUserId);

      return {
        success: true,
        message: 'Last login updated successfully',
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to update last login',
        errors: [errorMessage],
      };
    }
  }

  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    try {
      const users = await this.userService.searchUsers(
        request.query,
        request.limit,
      );

      return {
        success: true,
        message: 'Users found successfully',
        users: users.map((user) => this.mapToUserProfileRequired(user)),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to search users',
        users: [],
        errors: [errorMessage],
      };
    }
  }

  async getUsersByAuthUserIds(
    request: GetUsersByAuthUserIdsRequest,
  ): Promise<GetUsersByAuthUserIdsResponse> {
    try {
      const users = await this.userService.getUsersByAuthUserIds(
        request.authUserIds,
      );

      return {
        success: true,
        message: 'Users retrieved successfully',
        users: users.map((user) => this.mapToUserProfileRequired(user)),
        errors: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Failed to retrieve users',
        users: [],
        errors: [errorMessage],
      };
    }
  }

  health(): HealthResponse {
    return {
      message: 'User service is healthy',
    };
  }

  private mapToUserProfile(user: UserDocument | null): UserProfile | null {
    if (!user) return null;

    const userDoc = user as UserDocument & {
      createdAt?: Date;
      updatedAt?: Date;
    };

    return {
      authUserId: user.authUserId,
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
      createdAt: userDoc.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: userDoc.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private mapToUserProfileRequired(user: User | UserDocument): UserProfile {
    const profile = this.mapToUserProfile(user as UserDocument);
    if (!profile) {
      throw new Error('Failed to map user profile');
    }
    return profile;
  }
}
