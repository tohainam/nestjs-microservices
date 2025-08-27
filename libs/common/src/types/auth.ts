/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// User Service Interfaces
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
  accessToken: string;
  refreshToken: string;
  message: string;
  success: boolean;
  user: UserProfile;
  errors: string[];
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  userId: string;
  message: string;
  errors: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
  success: boolean;
  errors: string[];
}

export interface GetUserProfileRequest {
  userId: string;
}

export interface UpdateUserProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Service Interfaces
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

export interface HealthRequest {}

// Health check response
export interface HealthResponse {
  message: string;
}

// Common response wrapper
export interface BaseResponse {
  success: boolean;
  message: string;
  errors: string[];
}

// Package names
export const AUTH_PACKAGE_NAME = 'auth';
export const USER_SERVICE_NAME = 'UserService';
export const AUTH_SERVICE_NAME = 'AuthService';

// User Service Client
export interface UserServiceClient {
  register(request: RegisterRequest): Observable<RegisterResponse>;
  login(request: LoginRequest): Observable<LoginResponse>;
  validateToken(
    request: ValidateTokenRequest,
  ): Observable<ValidateTokenResponse>;
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse>;
  getUserProfile(request: GetUserProfileRequest): Observable<UserProfile>;
  updateUserProfile(request: UpdateUserProfileRequest): Observable<UserProfile>;
}

// User Service Controller
export interface UserServiceController {
  register(
    request: RegisterRequest,
  ):
    | Promise<RegisterResponse>
    | Observable<RegisterResponse>
    | RegisterResponse;

  login(
    request: LoginRequest,
  ): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  validateToken(
    request: ValidateTokenRequest,
  ):
    | Promise<ValidateTokenResponse>
    | Observable<ValidateTokenResponse>
    | ValidateTokenResponse;

  refreshToken(
    request: RefreshTokenRequest,
  ):
    | Promise<RefreshTokenResponse>
    | Observable<RefreshTokenResponse>
    | RefreshTokenResponse;

  getUserProfile(
    request: GetUserProfileRequest,
  ): Promise<UserProfile> | Observable<UserProfile> | UserProfile;

  updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UserProfile> | Observable<UserProfile> | UserProfile;
}

// Auth Service Client
export interface AuthServiceClient {
  authenticate(request: AuthenticateRequest): Observable<AuthenticateResponse>;
  revokeToken(request: RevokeTokenRequest): Observable<RevokeTokenResponse>;
  health(request: HealthRequest): Observable<HealthResponse>;
}

// Auth Service Controller
export interface AuthServiceController {
  authenticate(
    request: AuthenticateRequest,
  ):
    | Promise<AuthenticateResponse>
    | Observable<AuthenticateResponse>
    | AuthenticateResponse;

  revokeToken(
    request: RevokeTokenRequest,
  ):
    | Promise<RevokeTokenResponse>
    | Observable<RevokeTokenResponse>
    | RevokeTokenResponse;

  health(
    request: HealthRequest,
  ): Promise<HealthResponse> | Observable<HealthResponse> | HealthResponse;
}

// User Service Controller Methods
export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'register',
      'login',
      'validateToken',
      'refreshToken',
      'getUserProfile',
      'updateUserProfile',
    ];

    for (const method of grpcMethods) {
      const descriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      ) as PropertyDescriptor;
      GrpcMethod(USER_SERVICE_NAME, method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }

    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      ) as PropertyDescriptor;
      GrpcStreamMethod(USER_SERVICE_NAME, method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

// Auth Service Controller Methods
export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['authenticate', 'revokeToken', 'health'];

    for (const method of grpcMethods) {
      const descriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      ) as PropertyDescriptor;
      GrpcMethod(AUTH_SERVICE_NAME, method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }

    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      ) as PropertyDescriptor;
      GrpcStreamMethod(AUTH_SERVICE_NAME, method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}
