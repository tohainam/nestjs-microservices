import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { AuthServiceControllerMethods } from '@app/common';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  authenticate(request: { Authentication: string }) {
    return { message: `Authenticated: ${request.Authentication}` };
  }

  login(request: { username: string; password: string }) {
    // Demo: always returns a static token
    return {
      token: 'demo-token',
      message: `Logged in as ${request.username}`,
    };
  }

  register(request: { username: string; password: string; email: string }) {
    // Demo: always returns a static userId
    return {
      userId: 'demo-user-id',
      message: `Registered user ${request.username} with email ${request.email}`,
    };
  }
}
