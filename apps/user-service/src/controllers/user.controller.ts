import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: { userId: string; firstName: string; lastName: string }
  ) {
    return this.userService.createUser(
      createUserDto.userId,
      createUserDto.firstName,
      createUserDto.lastName
    );
  }

  @Get(':userId')
  async getUserByUserId(@Param('userId') userId: string) {
    return this.userService.getUserByUserId(userId);
  }

  @Put(':userId')
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() updateData: any
  ) {
    return this.userService.updateUserProfile(userId, updateData);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }

  @Put(':userId/deactivate')
  async deactivateUser(@Param('userId') userId: string) {
    return this.userService.deactivateUser(userId);
  }

  @Put(':userId/activate')
  async activateUser(@Param('userId') userId: string) {
    return this.userService.activateUser(userId);
  }

  @Put(':userId/last-login')
  async updateLastLogin(@Param('userId') userId: string) {
    await this.userService.updateLastLogin(userId);
    return { message: 'Last login updated successfully' };
  }

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.searchUsers(query, limit);
  }

  @Post('batch')
  async getUsersByIds(@Body() body: { userIds: string[] }) {
    return this.userService.getUsersByIds(body.userIds);
  }
}