import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthClientService } from '../services/auth-client.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authClientService: AuthClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('Valid token is required');
    }

    try {
      const result = await this.authClientService.authenticate({ token });
      
      if (!result.authenticated) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Add user info to request for use in controllers
      request.user = {
        userId: result.userId,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}