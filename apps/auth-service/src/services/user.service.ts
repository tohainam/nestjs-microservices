import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetUserProfileRequest,
  UserProfile,
  UpdateUserProfileRequest,
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
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

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
          message: 'Password does not meet requirements',
          success: false,
          errors: [
            'Password must be at least 8 characters long',
            'Password must contain at least one uppercase letter',
            'Password must contain at least one lowercase letter',
            'Password must contain at least one number',
            'Password must contain at least one special character',
          ],
        };
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(
        request.password,
      );

      // Create user
      const user = new this.userModel({
        username: request.username,
        email: request.email,
        password: hashedPassword,
        firstName: request.firstName,
        lastName: request.lastName,
      });

      const savedUser = await user.save();

      return {
        userId: safeObjectIdToString(savedUser._id),
        message: 'User registered successfully',
        success: true,
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        userId: '',
        message: 'Registration failed',
        success: false,
        errors: [errorMessage],
      };
    }
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Find user by username or email
      const user = await this.userModel.findOne({
        $or: [{ username: request.username }, { email: request.username }],
      });

      if (!user) {
        return {
          accessToken: '',
          refreshToken: '',
          message: 'Invalid credentials',
          success: false,
          user: {
            userId: '',
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          errors: ['Invalid username or password'],
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          accessToken: '',
          refreshToken: '',
          message: 'Account is deactivated',
          success: false,
          user: {
            userId: '',
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          errors: ['Account is deactivated'],
        };
      }

      // Verify password
      const isPasswordValid = await this.passwordService.comparePassword(
        request.password,
        user.password,
      );

      if (!isPasswordValid) {
        return {
          accessToken: '',
          refreshToken: '',
          message: 'Invalid credentials',
          success: false,
          user: {
            userId: '',
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          errors: ['Invalid username or password'],
        };
      }

      // Generate tokens
      const accessToken = this.jwtService.generateAccessToken({
        userId: safeObjectIdToString(user._id),
        username: user.username,
      });

      const refreshToken = this.jwtService.generateRefreshToken({
        userId: safeObjectIdToString(user._id),
        username: user.username,
      });

      // Update user's refresh token and last login
      await this.userModel.findByIdAndUpdate(user._id, {
        refreshToken,
        lastLoginAt: new Date(),
      });

      // Create user profile
      const timestamps = extractTimestamps(user);
      const userProfile: UserProfile = {
        userId: safeObjectIdToString(user._id),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: timestamps.createdAt,
        updatedAt: timestamps.updatedAt,
      };

      return {
        accessToken,
        refreshToken,
        message: 'Login successful',
        success: true,
        user: userProfile,
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        accessToken: '',
        refreshToken: '',
        message: 'Login failed',
        success: false,
        user: {
          userId: '',
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        errors: [errorMessage],
      };
    }
  }

  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    try {
      const payload = this.jwtService.verifyAccessToken(request.token);

      if (!payload) {
        return {
          isValid: false,
          userId: '',
          message: 'Invalid token',
          errors: ['Token is invalid or expired'],
        };
      }

      // Check if user still exists and is active
      const user = await this.userModel.findById(payload.userId);
      if (!user || !user.isActive) {
        return {
          isValid: false,
          userId: '',
          message: 'User not found or inactive',
          errors: ['User not found or inactive'],
        };
      }

      return {
        isValid: true,
        userId: payload.userId,
        message: 'Token is valid',
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        isValid: false,
        userId: '',
        message: 'Token validation failed',
        errors: [errorMessage],
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
          accessToken: '',
          refreshToken: '',
          message: 'Invalid refresh token',
          success: false,
          errors: ['Refresh token is invalid or expired'],
        };
      }

      // Check if user exists and refresh token matches
      const user = await this.userModel.findById(payload.userId);
      if (!user || user.refreshToken !== request.refreshToken) {
        return {
          accessToken: '',
          refreshToken: '',
          message: 'Invalid refresh token',
          success: false,
          errors: ['Refresh token mismatch'],
        };
      }

      // Generate new tokens
      const newAccessToken = this.jwtService.generateAccessToken({
        userId: safeObjectIdToString(user._id),
        username: user.username,
      });

      const newRefreshToken = this.jwtService.generateRefreshToken({
        userId: safeObjectIdToString(user._id),
        username: user.username,
      });

      // Update user's refresh token
      await this.userModel.findByIdAndUpdate(user._id, {
        refreshToken: newRefreshToken,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: 'Token refreshed successfully',
        success: true,
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        accessToken: '',
        refreshToken: '',
        message: 'Token refresh failed',
        success: false,
        errors: [errorMessage],
      };
    }
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<UserProfile> {
    const user = await this.userModel.findById(request.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const timestamps = extractTimestamps(user);
    return {
      userId: safeObjectIdToString(user._id),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
    };
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    const user = await this.userModel.findByIdAndUpdate(
      request.userId,
      {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const timestamps = extractTimestamps(user);
    return {
      userId: safeObjectIdToString(user._id),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
    };
  }
}
