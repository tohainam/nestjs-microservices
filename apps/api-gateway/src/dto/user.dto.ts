import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Auth service user id', example: 'auth-123' })
  @IsString()
  @IsNotEmpty()
  authUserId: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}

export class GetUserByAuthUserIdDto {
  @ApiProperty({ description: 'Auth service user id', example: 'auth-123' })
  @IsString()
  @IsNotEmpty()
  authUserId: string;
}

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'Auth service user id', example: 'auth-123' })
  @IsString()
  @IsNotEmpty()
  authUserId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class SearchUsersDto {
  @ApiProperty({ description: 'query text', example: 'john' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ description: 'limit results', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class UsersByIdsDto {
  @ApiProperty({ type: [String], description: 'List of auth user ids' })
  @IsArray()
  @IsString({ each: true })
  authUserIds: string[];
}

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false, type: [String] })
  errors?: string[];
}

export class UserProfileResponseDto {
  @ApiProperty()
  authUserId: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty({ required: false })
  profilePicture?: string;
}
