import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  USER_SERVICE_NAME,
  type UserServiceClient,
  type CreateUserRequest,
  type CreateUserResponse,
  type GetUserByAuthUserIdRequest,
  type GetUserByAuthUserIdResponse,
  type UpdateUserProfileRequest,
  type UpdateUserProfileResponse,
  type DeleteUserRequest,
  type DeleteUserResponse,
  type ActivateUserRequest,
  type ActivateUserResponse,
  type DeactivateUserRequest,
  type DeactivateUserResponse,
  type UpdateLastLoginRequest,
  type UpdateLastLoginResponse,
  type SearchUsersRequest,
  type SearchUsersResponse,
  type GetUsersByAuthUserIdsRequest,
  type GetUsersByAuthUserIdsResponse,
  type HealthResponse,
} from '@app/common';

@Injectable()
export class UserClientService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(
    @Inject(USER_SERVICE_NAME as string)
    private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
  }

  async health(): Promise<HealthResponse> {
    return firstValueFrom(this.userService.health({} as any));
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    return firstValueFrom(this.userService.createUser(request));
  }

  async getUserByAuthUserId(
    request: GetUserByAuthUserIdRequest,
  ): Promise<GetUserByAuthUserIdResponse> {
    return firstValueFrom(this.userService.getUserByAuthUserId(request));
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    return firstValueFrom(this.userService.updateUserProfile(request));
  }

  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    return firstValueFrom(this.userService.deleteUser(request));
  }

  async activateUser(
    request: ActivateUserRequest,
  ): Promise<ActivateUserResponse> {
    return firstValueFrom(this.userService.activateUser(request));
  }

  async deactivateUser(
    request: DeactivateUserRequest,
  ): Promise<DeactivateUserResponse> {
    return firstValueFrom(this.userService.deactivateUser(request));
  }

  async updateLastLogin(
    request: UpdateLastLoginRequest,
  ): Promise<UpdateLastLoginResponse> {
    return firstValueFrom(this.userService.updateLastLogin(request));
  }

  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    return firstValueFrom(this.userService.searchUsers(request));
  }

  async getUsersByAuthUserIds(
    request: GetUsersByAuthUserIdsRequest,
  ): Promise<GetUsersByAuthUserIdsResponse> {
    return firstValueFrom(this.userService.getUsersByAuthUserIds(request));
  }
}
