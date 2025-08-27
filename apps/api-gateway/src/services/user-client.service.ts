import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { getOrInitGrpcService } from '@app/shared-infra';
import {
  USER_SERVICE_NAME,
  USER_GRPC_SERVICE,
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
      this.userClient.getService<UserServiceClient>(USER_GRPC_SERVICE);
  }

  // Ensure client is available even if called before onModuleInit
  private getUserService(): UserServiceClient {
    return getOrInitGrpcService<UserServiceClient>(
      this.userService,
      this.userClient,
      USER_GRPC_SERVICE,
      (svc) => (this.userService = svc),
    );
  }

  async health(): Promise<HealthResponse> {
    return firstValueFrom(
      this.getUserService().health({} as Record<string, never>),
    );
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    return firstValueFrom(this.getUserService().createUser(request));
  }

  async getUserByAuthUserId(
    request: GetUserByAuthUserIdRequest,
  ): Promise<GetUserByAuthUserIdResponse> {
    return firstValueFrom(this.getUserService().getUserByAuthUserId(request));
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    return firstValueFrom(this.getUserService().updateUserProfile(request));
  }

  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    return firstValueFrom(this.getUserService().deleteUser(request));
  }

  async activateUser(
    request: ActivateUserRequest,
  ): Promise<ActivateUserResponse> {
    return firstValueFrom(this.getUserService().activateUser(request));
  }

  async deactivateUser(
    request: DeactivateUserRequest,
  ): Promise<DeactivateUserResponse> {
    return firstValueFrom(this.getUserService().deactivateUser(request));
  }

  async updateLastLogin(
    request: UpdateLastLoginRequest,
  ): Promise<UpdateLastLoginResponse> {
    return firstValueFrom(this.getUserService().updateLastLogin(request));
  }

  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    return firstValueFrom(this.getUserService().searchUsers(request));
  }

  async getUsersByAuthUserIds(
    request: GetUsersByAuthUserIdsRequest,
  ): Promise<GetUsersByAuthUserIdsResponse> {
    return firstValueFrom(this.getUserService().getUsersByAuthUserIds(request));
  }
}
