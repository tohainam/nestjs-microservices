import { Controller } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
} from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Health')
  health() {
    return { message: 'Auth service is healthy' };
  }

  @GrpcMethod('AuthService', 'Authenticate')
  async authenticate(
    request: AuthenticateRequest,
  ): Promise<AuthenticateResponse> {
    return this.authService.authenticate(request);
  }

  @GrpcMethod('AuthService', 'RevokeToken')
  revokeToken(request: RevokeTokenRequest): RevokeTokenResponse {
    return this.authService.revokeToken(request);
  }
}
