import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { AuthClientService } from '../services/auth-client.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ValidateTokenDto,
  GetUserProfileDto,
  UpdateUserProfileDto,
  ApiResponseDto,
  RegisterResponseDto,
  LoginResponseDto,
  UserProfileResponseDto,
  TokenValidationResponseDto,
} from '../dto/auth.dto';
import { AuthGuard } from '../guards/auth.guard';
import { HealthResponse } from '@app/common';

@ApiTags('Authentication')
@Controller('auth')
@ApiProduces('application/json')
@ApiConsumes('application/json')
export class AuthController {
  constructor(private readonly authClientService: AuthClientService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Check the health of the authentication service',
  })
  async health(): Promise<ApiResponseDto<HealthResponse>> {
    const result = await this.authClientService.health();
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User Registration',
    description:
      'Register a new user account with username, email, and password',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration information',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: ApiResponseDto<RegisterResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponseDto<RegisterResponseDto>> {
    const result = await this.authClientService.register({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: {
          userId: result.userId,
        },
      };
    } else {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with username/email and password to get access tokens',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: ApiResponseDto<LoginResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const result = await this.authClientService.login({
      username: loginDto.username,
      password: loginDto.password,
    });

    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
      };
    } else {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Access Token',
    description:
      'Get new access and refresh tokens using a valid refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token for getting new tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: ApiResponseDto<{ accessToken: string; refreshToken: string }>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid refresh token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponseDto<{ accessToken: string; refreshToken: string }>> {
    const result = await this.authClientService.refreshToken({
      refreshToken: refreshTokenDto.refreshToken,
    });

    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };
    } else {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate Access Token',
    description: 'Validate an access token and get user information',
  })
  @ApiBody({
    type: ValidateTokenDto,
    description: 'Access token to validate',
  })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    type: ApiResponseDto<TokenValidationResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async validateToken(
    @Body() validateTokenDto: ValidateTokenDto,
  ): Promise<ApiResponseDto<TokenValidationResponseDto>> {
    const result = await this.authClientService.validateToken({
      token: validateTokenDto.token,
    });

    return {
      success: result.isValid,
      message: result.message,
      data: {
        isValid: result.isValid,
        userId: result.userId,
      },
      errors: result.errors,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout user and revoke the current access token',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: ApiResponseDto<null>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async logout(
    @Headers('authorization') authHeader: string,
  ): Promise<ApiResponseDto<null>> {
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      await this.authClientService.revokeToken({ token });
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('profile/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get User Profile',
    description: 'Retrieve user profile information by user ID',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ApiResponseDto<UserProfileResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserProfile(
    @Param() params: GetUserProfileDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    try {
      const userProfile = await this.authClientService.getUserProfile({
        userId: params.userId,
      });

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: userProfile,
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        message: 'Failed to retrieve user profile',
        errors: [errorMessage],
      };
    }
  }

  @Put('profile/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update User Profile',
    description:
      'Update user profile information (first name, last name, email)',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateUserProfileDto,
    description: 'Updated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: ApiResponseDto<UserProfileResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  async updateUserProfile(
    @Param() params: GetUserProfileDto,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    try {
      const userProfile = await this.authClientService.updateUserProfile({
        userId: params.userId,
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        email: updateProfileDto.email,
      });

      return {
        success: true,
        message: 'User profile updated successfully',
        data: userProfile,
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        success: false,
        message: 'Failed to update user profile',
        errors: [errorMessage],
      };
    }
  }
}

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
