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
  UseGuards
} from '@nestjs/common';
import { AuthClientService } from '../services/auth-client.service';
import { 
  RegisterDto, 
  LoginDto, 
  RefreshTokenDto, 
  ValidateTokenDto,
  GetUserProfileDto,
  UpdateUserProfileDto
} from '../dto/auth.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClientService: AuthClientService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
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
  async login(@Body() loginDto: LoginDto) {
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
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
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
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
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
  async logout(@Headers('authorization') authHeader: string) {
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
  async getUserProfile(@Param() params: GetUserProfileDto) {
    try {
      const userProfile = await this.authClientService.getUserProfile({
        userId: params.userId,
      });

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: userProfile,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user profile',
        errors: [error.message],
      };
    }
  }

  @Put('profile/:userId')
  @UseGuards(AuthGuard)
  async updateUserProfile(
    @Param() params: GetUserProfileDto,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
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
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update user profile',
        errors: [error.message],
      };
    }
  }
}