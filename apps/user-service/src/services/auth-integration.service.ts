import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class AuthIntegrationService {
  constructor(private readonly userService: UserService) {}

  /**
   * This method demonstrates how the auth-service and user-service work together.
   * When a user registers in the auth-service, this method should be called
   * to create the corresponding user profile in the user-service.
   */
  async createUserProfileAfterAuth(
    userId: string,
    firstName: string,
    lastName: string
  ) {
    try {
      // Create user profile in user-service
      const userProfile = await this.userService.createUser(
        userId,
        firstName,
        lastName
      );

      console.log(`User profile created for userId: ${userId}`);
      return userProfile;
    } catch (error) {
      console.error(`Failed to create user profile for userId: ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update last login timestamp when user authenticates
   */
  async updateLastLoginAfterAuth(userId: string) {
    try {
      await this.userService.updateLastLogin(userId);
      console.log(`Last login updated for userId: ${userId}`);
    } catch (error) {
      console.error(`Failed to update last login for userId: ${userId}:`, error);
      // Don't throw error as this is not critical for authentication
    }
  }

  /**
   * Get user profile for authenticated user
   */
  async getUserProfileForAuth(userId: string) {
    try {
      const userProfile = await this.userService.getUserByUserId(userId);
      return userProfile;
    } catch (error) {
      console.error(`Failed to get user profile for userId: ${userId}:`, error);
      return null;
    }
  }
}