import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
  UpdateUserProfileRequest
} from '@app/common';

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
        const errors = [];
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
      const isPasswordValid = await this.passwordService.validatePassword(request.password);
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
      const hashedPassword = await this.passwordService.hashPassword(request.password);

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
        userId: savedUser._id.toString(),
        message: 'User registered successfully',
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        userId: '',
        message: 'Registration failed',
        success: false,
        errors: [error.message],
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
          user: null,
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
          user: null,
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
          user: null,
          errors: ['Invalid username or password'],
        };
      }

      // Generate tokens
      const accessToken = this.jwtService.generateAccessToken({
        userId: user._id.toString(),
        username: user.username,
      });

      const refreshToken = this.jwtService.generateRefreshToken({
        userId: user._id.toString(),
        username: user.username,
      });

      // Update user's refresh token and last login
      await this.userModel.findByIdAndUpdate(user._id, {
        refreshToken,
        lastLoginAt: new Date(),
      });

      // Create user profile
      const userProfile: UserProfile = {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      return {
        accessToken,
        refreshToken,
        message: 'Login successful',
        success: true,
        user: userProfile,
        errors: [],
      };
    } catch (error) {
      return {
        accessToken: '',
        refreshToken: '',
        message: 'Login failed',
        success: false,
        user: null,
        errors: [error.message],
      };
    }
  }

  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
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
    } catch (error) {
      return {
        isValid: false,
        userId: '',
        message: 'Token validation failed',
        errors: [error.message],
      };
    }
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
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
        userId: user._id.toString(),
        username: user.username,
      });

      const newRefreshToken = this.jwtService.generateRefreshToken({
        userId: user._id.toString(),
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
    } catch (error) {
      return {
        accessToken: '',
        refreshToken: '',
        message: 'Token refresh failed',
        success: false,
        errors: [error.message],
      };
    }
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<UserProfile> {
    const user = await this.userModel.findById(request.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateUserProfile(request: UpdateUserProfileRequest): Promise<UserProfile> {
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

    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}