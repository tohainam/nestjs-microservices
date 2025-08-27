import { Controller } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthServiceControllerMethods } from '@app/common';
import { 
  AuthenticateRequest, 
  AuthenticateResponse, 
  RevokeTokenRequest, 
  RevokeTokenResponse 
} from '@app/common';

@Controller()
@AuthServiceControllerMethods()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse> {
    return this.authService.authenticate(request);
  }

  async revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    return this.authService.revokeToken(request);
  }
}