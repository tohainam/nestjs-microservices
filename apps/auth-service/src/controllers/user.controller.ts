import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@app/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.userService.register(request);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(request);
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return this.userService.validateToken(request);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return this.userService.refreshToken(request);
  }
}
