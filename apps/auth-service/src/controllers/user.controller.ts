import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserServiceControllerMethods } from '@app/common';
import { 
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
  UpdateUserProfileRequest
} from '@app/common';

@Controller()
@UserServiceControllerMethods()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.userService.register(request);
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(request);
  }

  async validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    return this.userService.validateToken(request);
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.userService.refreshToken(request);
  }

  async getUserProfile(request: GetUserProfileRequest): Promise<UserProfile> {
    return this.userService.getUserProfile(request);
  }

  async updateUserProfile(request: UpdateUserProfileRequest): Promise<UserProfile> {
    return this.userService.updateUserProfile(request);
  }
}