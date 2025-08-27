import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserClientService } from '../services/user-client.service';
import { ApiResponseDto } from '../dto/common.dto';
import { ROUTE_USERS, API_BEARER_NAME } from '@app/common';
import {
  CreateUserDto,
  GetUserByAuthUserIdDto,
  SearchUsersDto,
  UpdateUserProfileDto,
  UserProfileResponseDto,
  UsersByIdsDto,
} from '../dto/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Users')
@ApiBearerAuth(API_BEARER_NAME)
@Controller(ROUTE_USERS)
export class UserController {
  constructor(private readonly userClient: UserClientService) {}

  private toUserProfileResponse(u: {
    authUserId: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }): UserProfileResponseDto {
    return {
      authUserId: u.authUserId,
      firstName: u.firstName,
      lastName: u.lastName,
      profilePicture: u.profilePicture,
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health(): Promise<ApiResponseDto<{ message: string }>> {
    const result = await this.userClient.health();
    return { success: true, message: result.message } as ApiResponseDto<{
      message: string;
    }>;
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user profile' })
  @ApiBody({ type: CreateUserDto })
  async create(
    @Body() body: CreateUserDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    const result = await this.userClient.createUser(body);
    if (result.success && result.user) {
      return {
        success: true,
        message: result.message,
        data: this.toUserProfileResponse(result.user),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }

  @Get(':authUserId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by auth user id' })
  @ApiParam({ name: 'authUserId', description: 'Auth user id' })
  async getByAuthUserId(
    @Param() params: GetUserByAuthUserIdDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    const result = await this.userClient.getUserByAuthUserId(params);
    if (result.success && result.user) {
      return {
        success: true,
        message: result.message,
        data: this.toUserProfileResponse(result.user),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }

  @Put(':authUserId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'authUserId', description: 'Auth user id' })
  async update(
    @Param() params: GetUserByAuthUserIdDto,
    @Body() body: Omit<UpdateUserProfileDto, 'authUserId'>,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    const result = await this.userClient.updateUserProfile({
      authUserId: params.authUserId,
      ...body,
    });
    if (result.success && result.user) {
      return {
        success: true,
        message: result.message,
        data: this.toUserProfileResponse(result.user),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }

  @Delete(':authUserId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiParam({ name: 'authUserId', description: 'Auth user id' })
  async delete(
    @Param() params: GetUserByAuthUserIdDto,
  ): Promise<ApiResponseDto<null>> {
    const result = await this.userClient.deleteUser({
      authUserId: params.authUserId,
    });
    return result.success
      ? ({ success: true, message: result.message } as ApiResponseDto<null>)
      : { success: false, message: result.message, errors: result.errors };
  }

  @Post(':authUserId/activate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user' })
  async activate(
    @Param() params: GetUserByAuthUserIdDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    const result = await this.userClient.activateUser({
      authUserId: params.authUserId,
    });
    if (result.success && result.user) {
      return {
        success: true,
        message: result.message,
        data: this.toUserProfileResponse(result.user),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }

  @Post(':authUserId/deactivate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(
    @Param() params: GetUserByAuthUserIdDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto>> {
    const result = await this.userClient.deactivateUser({
      authUserId: params.authUserId,
    });
    if (result.success && result.user) {
      return {
        success: true,
        message: result.message,
        data: this.toUserProfileResponse(result.user),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }

  @Post(':authUserId/last-login')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update last login timestamp' })
  async updateLastLogin(
    @Param() params: GetUserByAuthUserIdDto,
  ): Promise<ApiResponseDto<null>> {
    const result = await this.userClient.updateLastLogin({
      authUserId: params.authUserId,
    });
    return result.success
      ? ({ success: true, message: result.message } as ApiResponseDto<null>)
      : { success: false, message: result.message, errors: result.errors };
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'query', required: true })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query() query: SearchUsersDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto[]>> {
    const result = await this.userClient.searchUsers({
      query: query.query,
      limit: query.limit ?? 10,
    });
    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: result.users.map((u) => this.toUserProfileResponse(u)),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }

  @Post('batch')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get multiple users by auth user ids' })
  @ApiBody({ type: UsersByIdsDto })
  async getUsersByIds(
    @Body() body: UsersByIdsDto,
  ): Promise<ApiResponseDto<UserProfileResponseDto[]>> {
    const result = await this.userClient.getUsersByAuthUserIds({
      authUserIds: body.authUserIds,
    });
    if (result.success) {
      return {
        success: true,
        message: result.message,
        data: result.users.map((u) => this.toUserProfileResponse(u)),
      };
    }
    return { success: false, message: result.message, errors: result.errors };
  }
}
