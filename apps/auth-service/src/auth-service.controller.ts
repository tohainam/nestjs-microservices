import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { AuthServiceControllerMethods } from '@app/common';

interface AuthenticationRequest {
  Authentication: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  authenticate(request: AuthenticationRequest) {
    return { message: `Authenticated: ${request.Authentication}` };
  }

  login(request: LoginRequest) {
    // Demo: always returns a static token
    return {
      token: 'demo-token',
      message: `Logged in as ${request.username}`,
    };
  }

  register(request: RegisterRequest) {
    // Demo: always returns a static userId
    return {
      userId: 'demo-user-id',
      message: `Registered user ${request.username} with email ${request.email}`,
    };
  }
}
