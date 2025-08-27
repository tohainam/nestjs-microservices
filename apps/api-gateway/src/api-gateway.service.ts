import { AUTH_SERVICE_NAME, AuthServiceClient } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class ApiGatewayService {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  demoAuthenticate(authString: string) {
    return this.authService.authenticate({ Authentication: authString });
  }

  demoLogin(username: string, password: string) {
    return this.authService.login({ username, password });
  }

  demoRegister(username: string, password: string, email: string) {
    return this.authService.register({ username, password, email });
  }
}
