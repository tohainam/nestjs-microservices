import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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

  private ensureInitialized(): void {
    if (!this.userService) {
      this.userService =
        this.userClient.getService<UserServiceClient>('UserService');
    }
  }

  async health(): Promise<HealthResponse> {
    this.ensureInitialized();
    return firstValueFrom(this.userService.health({} as HealthRequest));
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    this.ensureInitialized();
    return firstValueFrom(this.userService.createUser(request));
  }
}
