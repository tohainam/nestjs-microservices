import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthServiceControllerMethods } from '@app/common';
import { GrpcMethod } from '@nestjs/microservices';
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

  @GrpcMethod('AuthService', 'register')
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.userService.register(request);
  }

  @GrpcMethod('AuthService', 'login')
  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(request);
  }

  @GrpcMethod('AuthService', 'validateToken')
  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return this.userService.validateToken(request);
  }

  @GrpcMethod('AuthService', 'refreshToken')
  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return this.userService.refreshToken(request);
  }
}
