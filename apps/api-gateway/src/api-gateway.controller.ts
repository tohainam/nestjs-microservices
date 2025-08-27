import { Controller } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // This controller can be used for additional API Gateway endpoints
  // Authentication endpoints are now handled by AuthController
}
