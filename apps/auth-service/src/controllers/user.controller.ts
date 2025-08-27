import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthServiceControllerMethods } from '@app/common';
import {
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
@AuthServiceControllerMethods()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.userService.register(request);
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(request);
  }

  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return this.userService.validateToken(request);
  }

  async refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return this.userService.refreshToken(request);
  }
}
