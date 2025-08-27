import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
  UserServiceClient,
  AuthServiceClient,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GetUserProfileRequest,
  GetUserByAuthUserIdResponse,
  UserProfile,
  UpdateUserProfileRequest,
  AuthenticateRequest,
  AuthenticateResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  HealthResponse,
} from '@app/common';
import { getOrInitGrpcService } from '@app/shared-infra';
import {
  AUTH_SERVICE_NAME,
  USER_SERVICE_NAME,
  AUTH_GRPC_SERVICE,
  USER_GRPC_SERVICE,
} from '@app/common';

@Injectable()
export class AuthClientService implements OnModuleInit {
  private userService: UserServiceClient;
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME as string)
    private readonly authClient: ClientGrpc,
    @Inject(USER_SERVICE_NAME as string)
    private readonly userClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService =
      this.userClient.getService<UserServiceClient>(USER_GRPC_SERVICE);
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_GRPC_SERVICE);
  }

  // Ensure clients are available even if called before onModuleInit
  private getUserService(): UserServiceClient {
    return getOrInitGrpcService<UserServiceClient>(
      this.userService,
      this.userClient,
      USER_GRPC_SERVICE,
      (svc) => (this.userService = svc),
    );
  }

  private getAuthService(): AuthServiceClient {
    return getOrInitGrpcService<AuthServiceClient>(
      this.authService,
      this.authClient,
      AUTH_GRPC_SERVICE,
      (svc) => (this.authService = svc),
    );
  }

  async health(): Promise<HealthResponse> {
    return firstValueFrom(this.getAuthService().health({}));
  }

  // Auth Service Methods (via AuthService)
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return firstValueFrom(this.getAuthService().register(request));
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.getAuthService().login(request));
  }

  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return firstValueFrom(this.getAuthService().validateToken(request));
  }

  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return firstValueFrom(this.getAuthService().refreshToken(request));
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<UserProfile> {
    const userRequest = { authUserId: request.userId };
    const response: GetUserByAuthUserIdResponse = await firstValueFrom(
      this.getUserService().getUserByAuthUserId(userRequest),
    );
    if (!response.user) {
      throw new Error('User not found');
    }
    return response.user;
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    const response = await firstValueFrom(
      this.getUserService().updateUserProfile(request),
    );
    return response.user as UserProfile;
  }

  // Auth Service Methods
  async authenticate(
    request: AuthenticateRequest,
  ): Promise<AuthenticateResponse> {
    return firstValueFrom(this.getAuthService().authenticate(request));
  }

  async revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    return firstValueFrom(this.getAuthService().revokeToken(request));
  }
}
