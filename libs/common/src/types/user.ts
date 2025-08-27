/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// User Service Interfaces - Only user profile related
export interface CreateUserRequest {
  authUserId: string; // Reference to auth-service user ID
  firstName: string;
  lastName: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  errors: string[];
}

export interface GetUserByAuthUserIdRequest {
  authUserId: string;
}

export interface GetUserByAuthUserIdResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  errors: string[];
}

export interface UpdateUserProfileRequest {
  authUserId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
  phoneNumber?: string;
  address?: Address;
  preferences?: UserPreferences;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  errors: string[];
}

export interface DeleteUserRequest {
  authUserId: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  errors: string[];
}

export interface ActivateUserRequest {
  authUserId: string;
}

export interface ActivateUserResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  errors: string[];
}

export interface DeactivateUserRequest {
  authUserId: string;
}

export interface DeactivateUserResponse {
  success: boolean;
  message: string;
  user: UserProfile;
  errors: string[];
}

export interface UpdateLastLoginRequest {
  authUserId: string;
}

export interface UpdateLastLoginResponse {
  success: boolean;
  message: string;
  errors: string[];
}

export interface SearchUsersRequest {
  query: string;
  limit: number;
}

export interface SearchUsersResponse {
  success: boolean;
  message: string;
  users: UserProfile[];
  errors: string[];
}

export interface GetUsersByAuthUserIdsRequest {
  authUserIds: string[];
}

export interface GetUsersByAuthUserIdsResponse {
  success: boolean;
  message: string;
  users: UserProfile[];
  errors: string[];
}

export interface UserProfile {
  authUserId: string; // Reference to auth-service user ID
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: Address;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  notifications?: NotificationPreferences;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

// Health check
export interface HealthRequest {}

export interface HealthResponse {
  message: string;
}

// gRPC Method decorators
export const USER_PACKAGE_NAME = 'user';

export interface UserServiceClient {
  createUser(request: CreateUserRequest): Observable<CreateUserResponse>;
  getUserByAuthUserId(request: GetUserByAuthUserIdRequest): Observable<GetUserByAuthUserIdResponse>;
  updateUserProfile(request: UpdateUserProfileRequest): Observable<UpdateUserProfileResponse>;
  deleteUser(request: DeleteUserRequest): Observable<DeleteUserResponse>;
  activateUser(request: ActivateUserRequest): Observable<ActivateUserResponse>;
  deactivateUser(request: DeactivateUserRequest): Observable<DeactivateUserResponse>;
  updateLastLogin(request: UpdateLastLoginRequest): Observable<UpdateLastLoginResponse>;
  searchUsers(request: SearchUsersRequest): Observable<SearchUsersResponse>;
  getUsersByAuthUserIds(request: GetUsersByAuthUserIdsRequest): Observable<GetUsersByAuthUserIdsResponse>;
  health(request: HealthRequest): Observable<HealthResponse>;
}

export interface UserServiceController {
  createUser(request: CreateUserRequest): Promise<CreateUserResponse> | Observable<CreateUserResponse> | CreateUserResponse;
  getUserByAuthUserId(request: GetUserByAuthUserIdRequest): Promise<GetUserByAuthUserIdResponse> | Observable<GetUserByAuthUserIdResponse> | GetUserByAuthUserIdResponse;
  updateUserProfile(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> | Observable<UpdateUserProfileResponse> | UpdateUserProfileResponse;
  deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> | Observable<DeleteUserResponse> | DeleteUserResponse;
  activateUser(request: ActivateUserRequest): Promise<ActivateUserResponse> | Observable<ActivateUserResponse> | ActivateUserResponse;
  deactivateUser(request: DeactivateUserRequest): Promise<DeactivateUserResponse> | Observable<DeactivateUserResponse> | DeactivateUserResponse;
  updateLastLogin(request: UpdateLastLoginRequest): Promise<UpdateLastLoginResponse> | Observable<UpdateLastLoginResponse> | UpdateLastLoginResponse;
  searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> | Observable<SearchUsersResponse> | SearchUsersResponse;
  getUsersByAuthUserIds(request: GetUsersByAuthUserIdsRequest): Promise<GetUsersByAuthUserIdsResponse> | Observable<GetUsersByAuthUserIdsResponse> | GetUsersByAuthUserIdsResponse;
  health(request: HealthRequest): Promise<HealthResponse> | Observable<HealthResponse> | HealthResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createUser',
      'getUserByAuthUserId',
      'updateUserProfile',
      'deleteUser',
      'activateUser',
      'deactivateUser',
      'updateLastLogin',
      'searchUsers',
      'getUsersByAuthUserIds',
      'health',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod('UserService', method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod('UserService', method)(constructor.prototype[method], method, descriptor);
    }
  };
}