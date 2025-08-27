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
  UserProfile,
  UpdateUserProfileRequest,
  AuthenticateRequest,
  AuthenticateResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  HealthResponse,
} from '@app/common';
import { AUTH_SERVICE_NAME } from '@app/common';

@Injectable()
export class AuthClientService implements OnModuleInit {
  private userService: UserServiceClient;
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME as string) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async health(): Promise<HealthResponse> {
    return firstValueFrom(this.authService.health({}));
  }

  // Auth Service Methods (via AuthService)
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return firstValueFrom(this.authService.register(request));
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.authService.login(request));
  }

  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return firstValueFrom(this.authService.validateToken(request));
  }

  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return firstValueFrom(this.authService.refreshToken(request));
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<UserProfile> {
    const userRequest = { authUserId: request.userId };
    const response: { user: UserProfile } = await firstValueFrom(
      this.userService.getUserProfile(userRequest),
    );
    return response.user;
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UserProfile> {
    const response = await firstValueFrom(
      this.userService.updateUserProfile(request) as any,
    );
    return (response as any).user;
  }

  // Auth Service Methods
  async authenticate(
    request: AuthenticateRequest,
  ): Promise<AuthenticateResponse> {
    return firstValueFrom(this.authService.authenticate(request));
  }

  async revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    return firstValueFrom(this.authService.revokeToken(request));
  }
}
