import { Controller, Get, Query } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('demo-authenticate')
  demoAuthenticate(@Query('auth') auth: string) {
    return this.apiGatewayService.demoAuthenticate(auth);
  }

  @Get('demo-login')
  demoLogin(
    @Query('username') username: string,
    @Query('password') password: string,
  ) {
    return this.apiGatewayService.demoLogin(username, password);
  }

  @Get('demo-register')
  demoRegister(
    @Query('username') username: string,
    @Query('password') password: string,
    @Query('email') email: string,
  ) {
    return this.apiGatewayService.demoRegister(username, password, email);
  }
}
