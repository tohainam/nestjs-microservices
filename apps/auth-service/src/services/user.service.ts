import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { UserProfileClientService } from './user-profile-client.service';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@app/common';

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

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly userProfileClient: UserProfileClientService,
  ) {}

  // This method is used internally for authentication purposes only
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        $or: [{ username: request.username }, { email: request.email }],
      });

      if (existingUser) {
        const errors: string[] = [];
        if (existingUser.username === request.username) {
          errors.push('Username already exists');
        }
        if (existingUser.email === request.email) {
          errors.push('Email already exists');
        }

        return {
          userId: '',
          message: 'Registration failed',
          success: false,
          errors,
        };
      }

      // Validate password
      const isPasswordValid = this.passwordService.validatePassword(
        request.password,
      );
      if (!isPasswordValid) {
        return {
          userId: '',
          message: 'Password validation failed',
          success: false,
          errors: ['Password does not meet requirements'],
        };
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(
        request.password,
      );

      // Create user with only authentication data
      const user = new this.userModel({
        username: request.username,
        email: request.email,
        password: hashedPassword,
        isActive: true,
        isEmailVerified: false,
      });

      const savedUser = await user.save();
      const userId = safeObjectIdToString(savedUser._id);

      // Create user profile via gRPC (fire-and-forget semantics, but await for now)
      try {
        await this.userProfileClient.createUser({
          authUserId: userId,
          firstName: request.firstName,
          lastName: request.lastName,
        });
      } catch (profileError) {
        // Log and continue; registration of auth user succeeded
        console.error(
          'Failed to create user profile:',
          getErrorMessage(profileError),
        );
      }

      return {
        userId,
        message: 'Registration successful',
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        userId: '',
        message: 'Registration failed',
        success: false,
        errors: [getErrorMessage(error)],
      };
    }
  }

  // This method is used internally for authentication purposes only
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user by username or email
      const user = await this.userModel.findOne({
        $or: [{ username: request.username }, { email: request.username }],
      });

      if (!user || !user.isActive) {
        return {
          userId: '',
          accessToken: '',
          refreshToken: '',
          message: 'Invalid credentials or user is inactive',
          success: false,
          errors: ['Invalid credentials or user is inactive'],
        };
      }

      // Verify password
      const isPasswordValid = await this.passwordService.comparePassword(
        request.password,
        user.password,
      );

      if (!isPasswordValid) {
        return {
          userId: '',
          accessToken: '',
          refreshToken: '',
          message: 'Invalid credentials',
          success: false,
          errors: ['Invalid credentials'],
        };
      }

      const userId = safeObjectIdToString(user._id);

      // Generate tokens
      const accessToken = this.jwtService.generateAccessToken({
        userId,
        username: user.username,
      });
      const refreshToken = this.jwtService.generateRefreshToken({
        userId,
        username: user.username,
      });

      // Save refresh token
      user.refreshToken = refreshToken;
      await user.save();

      return {
        userId,
        accessToken,
        refreshToken,
        message: 'Login successful',
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        userId: '',
        accessToken: '',
        refreshToken: '',
        message: 'Login failed',
        success: false,
        errors: [getErrorMessage(error)],
      };
    }
  }

  // These methods are used internally for authentication purposes only
  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    try {
      const payload = this.jwtService.verifyAccessToken(request.token);

      if (!payload) {
        return {
          valid: false,
          userId: '',
          message: 'Token is invalid or expired',
          errors: ['Token is invalid or expired'],
        };
      }

      // Check if user still exists and is active
      const user = await this.userModel.findById(payload.userId);
      if (!user || !user.isActive) {
        return {
          valid: false,
          userId: '',
          message: 'User not found or inactive',
          errors: ['User not found or inactive'],
        };
      }

      return {
        valid: true,
        userId: payload.userId,
        message: 'Token is valid',
        errors: [],
      };
    } catch (error) {
      return {
        valid: false,
        userId: '',
        message: 'Token validation failed',
        errors: [getErrorMessage(error)],
      };
    }
  }

  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    try {
      const payload = this.jwtService.verifyRefreshToken(request.refreshToken);

      if (!payload) {
        return {
          userId: '',
          accessToken: '',
          message: 'Refresh token is invalid or expired',
          success: false,
          errors: ['Refresh token is invalid or expired'],
        };
      }

      // Check if user exists and refresh token matches
      const user = await this.userModel.findById(payload.userId);
      if (
        !user ||
        !user.isActive ||
        user.refreshToken !== request.refreshToken
      ) {
        return {
          userId: '',
          accessToken: '',
          message: 'Invalid refresh token or user not found',
          success: false,
          errors: ['Invalid refresh token or user not found'],
        };
      }

      const userId = safeObjectIdToString(user._id);

      // Generate new access token
      const accessToken = this.jwtService.generateAccessToken({
        userId,
        username: user.username,
      });

      return {
        userId,
        accessToken,
        message: 'Token refreshed successfully',
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        userId: '',
        accessToken: '',
        message: 'Token refresh failed',
        success: false,
        errors: [getErrorMessage(error)],
      };
    }
  }

  // This method is used internally for authentication purposes only
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findById(userId);
    } catch {
      return null;
    }
  }

  // These methods are used internally for token management
  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { refreshToken } },
      );
    } catch (error) {
      console.error(
        `Failed to update refresh token: ${getErrorMessage(error)}`,
      );
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { $unset: { refreshToken: 1 } },
      );
    } catch (error) {
      console.error(
        `Failed to revoke refresh token: ${getErrorMessage(error)}`,
      );
    }
  }
}
