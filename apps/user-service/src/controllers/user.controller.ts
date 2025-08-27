import { Controller } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserServiceControllerMethods } from '@app/common';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByAuthUserIdRequest,
  GetUserByAuthUserIdResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  ActivateUserRequest,
  ActivateUserResponse,
  DeactivateUserRequest,
  DeactivateUserResponse,
  UpdateLastLoginRequest,
  UpdateLastLoginResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  GetUsersByAuthUserIdsRequest,
  GetUsersByAuthUserIdsResponse,
  HealthResponse,
} from '@app/common';
import { isOk, toUserProfileRequired, type UserDoc } from '@app/common';
import {
  MSG_USER_CREATED,
  MSG_USER_CREATE_FAILED,
  MSG_USER_RETRIEVED,
  MSG_USER_RETRIEVE_FAILED,
  MSG_USER_UPDATED,
  MSG_USER_UPDATE_FAILED,
  MSG_USER_DELETED,
  MSG_USER_DELETE_FAILED,
  MSG_USER_ACTIVATED,
  MSG_USER_ACTIVATE_FAILED,
  MSG_USER_DEACTIVATED,
  MSG_USER_DEACTIVATE_FAILED,
  MSG_LAST_LOGIN_UPDATED,
  MSG_LAST_LOGIN_UPDATE_FAILED,
  MSG_USERS_FOUND,
  MSG_USERS_FOUND_FAILED,
  MSG_USERS_RETRIEVED,
  MSG_USERS_RETRIEVE_FAILED,
} from '@app/common';

@Controller()
@UserServiceControllerMethods()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    const res = await this.userService.createUser(
      request.authUserId,
      request.firstName,
      request.lastName,
    );
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USER_CREATED,
        user: toUserProfileRequired(res.value as unknown as UserDoc),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USER_CREATE_FAILED,
      user: null,
      errors: res.error,
    };
  }

  async getUserByAuthUserId(
    request: GetUserByAuthUserIdRequest,
  ): Promise<GetUserByAuthUserIdResponse> {
    const res = await this.userService.getUserByAuthUserId(request.authUserId);
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USER_RETRIEVED,
        user: toUserProfileRequired(res.value as unknown as UserDoc),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USER_RETRIEVE_FAILED,
      user: null,
      errors: res.error,
    };
  }

  async updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    const res = await this.userService.updateUserProfile(
      request.authUserId,
      request,
    );
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USER_UPDATED,
        user: toUserProfileRequired(res.value as unknown as UserDoc),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USER_UPDATE_FAILED,
      user: null,
      errors: res.error,
    };
  }

  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    const res = await this.userService.deleteUser(request.authUserId);
    if (isOk(res)) {
      return {
        success: res.value,
        message: res.value ? MSG_USER_DELETED : MSG_USER_DELETE_FAILED,
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USER_DELETE_FAILED,
      errors: res.error,
    };
  }

  async activateUser(
    request: ActivateUserRequest,
  ): Promise<ActivateUserResponse> {
    const res = await this.userService.activateUser(request.authUserId);
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USER_ACTIVATED,
        user: toUserProfileRequired(res.value as unknown as UserDoc),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USER_ACTIVATE_FAILED,
      user: null,
      errors: res.error,
    };
  }

  async deactivateUser(
    request: DeactivateUserRequest,
  ): Promise<DeactivateUserResponse> {
    const res = await this.userService.deactivateUser(request.authUserId);
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USER_DEACTIVATED,
        user: toUserProfileRequired(res.value as unknown as UserDoc),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USER_DEACTIVATE_FAILED,
      user: null,
      errors: res.error,
    };
  }

  async updateLastLogin(
    request: UpdateLastLoginRequest,
  ): Promise<UpdateLastLoginResponse> {
    const res = await this.userService.updateLastLogin(request.authUserId);
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_LAST_LOGIN_UPDATED,
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_LAST_LOGIN_UPDATE_FAILED,
      errors: res.error,
    };
  }

  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    const res = await this.userService.searchUsers(
      request.query,
      request.limit,
    );
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USERS_FOUND,
        users: res.value.map((user) =>
          toUserProfileRequired(user as unknown as UserDoc),
        ),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USERS_FOUND_FAILED,
      users: [],
      errors: res.error,
    };
  }

  async getUsersByAuthUserIds(
    request: GetUsersByAuthUserIdsRequest,
  ): Promise<GetUsersByAuthUserIdsResponse> {
    const res = await this.userService.getUsersByAuthUserIds(
      request.authUserIds,
    );
    if (isOk(res)) {
      return {
        success: true,
        message: MSG_USERS_RETRIEVED,
        users: res.value.map((user) =>
          toUserProfileRequired(user as unknown as UserDoc),
        ),
        errors: [],
      };
    }
    return {
      success: false,
      message: MSG_USERS_RETRIEVE_FAILED,
      users: [],
      errors: res.error,
    };
  }

  health(): HealthResponse {
    return {
      message: 'User service is healthy',
    };
  }

  // Mapping handled by shared mapper in @app/common
}
