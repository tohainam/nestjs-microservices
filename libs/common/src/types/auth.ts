/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// Auth Service Interfaces - Only authentication related
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
  success: boolean;
  errors: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  message: string;
  success: boolean;
  errors: string[];
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId: string;
  message: string;
  errors: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  userId: string;
  accessToken: string;
  message: string;
  success: boolean;
  errors: string[];
}

// Authentication service for token validation and management
export interface AuthenticateRequest {
  token: string;
}

export interface AuthenticateResponse {
  authenticated: boolean;
  userId: string;
  message: string;
  errors: string[];
}

export interface RevokeTokenRequest {
  token: string;
}

export interface RevokeTokenResponse {
  revoked: boolean;
  message: string;
  errors: string[];
}

// Health check
export interface HealthRequest {}

export interface HealthResponse {
  message: string;
}

// gRPC Method decorators
export const AUTH_PACKAGE_NAME = 'auth';

export interface AuthServiceClient {
  register(request: RegisterRequest): Observable<RegisterResponse>;
  login(request: LoginRequest): Observable<LoginResponse>;
  validateToken(request: ValidateTokenRequest): Observable<ValidateTokenResponse>;
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse>;
  authenticate(request: AuthenticateRequest): Observable<AuthenticateResponse>;
  revokeToken(request: RevokeTokenRequest): Observable<RevokeTokenResponse>;
  health(request: HealthRequest): Observable<HealthResponse>;
}

export interface AuthServiceController {
  register(request: RegisterRequest): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;
  login(request: LoginRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;
  validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse> | Observable<ValidateTokenResponse> | ValidateTokenResponse;
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> | Observable<RefreshTokenResponse> | RefreshTokenResponse;
  authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse> | Observable<AuthenticateResponse> | AuthenticateResponse;
  revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> | Observable<RevokeTokenResponse> | RevokeTokenResponse;
  health(request: HealthRequest): Promise<HealthResponse> | Observable<HealthResponse> | HealthResponse;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'register',
      'login',
      'validateToken',
      'refreshToken',
      'authenticate',
      'revokeToken',
      'health',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod('AuthService', method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod('AuthService', method)(constructor.prototype[method], method, descriptor);
    }
  };
}
