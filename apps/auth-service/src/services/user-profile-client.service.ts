import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { getOrInitGrpcService } from '@app/shared-infra';
import {
  USER_SERVICE_NAME,
  type UserServiceClient,
  type CreateUserRequest,
  type CreateUserResponse,
  type HealthRequest,
  type HealthResponse,
} from '@app/common';

@Injectable()
export class UserProfileClientService implements OnModuleInit {
  private userService!: UserServiceClient;

  constructor(
    @Inject(USER_SERVICE_NAME as string)
    private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>('UserService');
  }

  // Ensure client is available even if called before onModuleInit
  private getUserService(): UserServiceClient {
    return getOrInitGrpcService<UserServiceClient>(
      this.userService,
      this.userClient,
      'UserService',
      (svc) => (this.userService = svc),
    );
  }

  async health(): Promise<HealthResponse> {
    return firstValueFrom(this.getUserService().health({} as HealthRequest));
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    return firstValueFrom(this.getUserService().createUser(request));
  }
}
