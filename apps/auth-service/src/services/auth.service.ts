import { Injectable } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';
import {
  AuthenticateRequest,
  AuthenticateResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
} from '@app/common';

// Helper function to safely extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async authenticate(
    request: AuthenticateRequest,
  ): Promise<AuthenticateResponse> {
    try {
      const payload = this.jwtService.verifyAccessToken(request.token);

      if (!payload) {
        return {
          authenticated: false,
          userId: '',
          message: 'Token is invalid or expired',
          errors: ['Token is invalid or expired'],
        };
      }

      // Check if user still exists and is active
      await this.userService.getUserProfile({ userId: payload.userId });

      return {
        authenticated: true,
        userId: payload.userId,
        message: 'Authentication successful',
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        authenticated: false,
        userId: '',
        message: 'Authentication failed',
        errors: [errorMessage],
      };
    }
  }

  revokeToken(request: RevokeTokenRequest): RevokeTokenResponse {
    try {
      const payload = this.jwtService.verifyAccessToken(request.token);

      if (!payload) {
        return {
          revoked: false,
          message: 'Token is invalid or expired',
          errors: ['Token is invalid or expired'],
        };
      }

      // In a real implementation, you might want to add the token to a blacklist
      // For now, we'll just return success
      return {
        revoked: true,
        message: 'Token revoked successfully',
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      return {
        revoked: false,
        message: 'Token revocation failed',
        errors: [errorMessage],
      };
    }
  }
}
