import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// ApiResponseDto moved to ../dto/common.dto

export class RegisterDto {
  @ApiProperty({
    description: 'Username for the account',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: 'Email address for the account',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Password for the account (min 8 chars, must include uppercase, lowercase, number, and special char)',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Username or email for login',
    example: 'john_doe',
    oneOf: [
      { type: 'string', pattern: '^[a-zA-Z0-9_]+$' },
      { type: 'string', format: 'email' },
    ],
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password for login',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to get new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ValidateTokenDto {
  @ApiProperty({
    description: 'Access token to validate',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class GetUserProfileDto {
  @ApiProperty({
    description: 'User ID to get profile for',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'User ID to update profile for',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Email address for the account',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

// Response DTOs for better API documentation
export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Username for the account',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address for the account',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last profile update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for getting new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileResponseDto,
  })
  user: UserProfileResponseDto;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable message about the operation result',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data payload',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Array of error messages if operation failed',
    type: [String],
    required: false,
    example: [],
  })
  errors?: string[];
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}

export class TokenValidationResponseDto {
  @ApiProperty({
    description: 'Indicates if the token is valid',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'User ID associated with the token',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}
