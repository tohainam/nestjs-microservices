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
  RevokeTokenResponse
} from '@app/common';
import { AUTH_SERVICE_NAME } from '@app/common';

@Injectable()
export class AuthClientService implements OnModuleInit {
  private userService: UserServiceClient;
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  // User Service Methods
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return firstValueFrom(this.userService.register(request));
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return firstValueFrom(this.userService.login(request));
  }

  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    return firstValueFrom(this.userService.validateToken(request));
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return firstValueFrom(this.userService.refreshToken(request));
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<UserProfile> {
    return firstValueFrom(this.userService.getUserProfile(request));
  }

  async updateUserProfile(request: UpdateUserProfileRequest): Promise<UserProfile> {
    return firstValueFrom(this.userService.updateUserProfile(request));
  }

  // Auth Service Methods
  async authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse> {
    return firstValueFrom(this.authService.authenticate(request));
  }

  async revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    return firstValueFrom(this.authService.revokeToken(request));
  }
}