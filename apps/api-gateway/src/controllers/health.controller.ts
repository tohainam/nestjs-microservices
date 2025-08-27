import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiResponse as ApiResponseDecorator 
} from '@nestjs/swagger';
import { HealthResponseDto } from '../dto/health.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health Check',
    description: 'Check the health status of the API Gateway service'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthResponseDto
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy or degraded'
  })
  async check(): Promise<HealthResponseDto> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      details: {
        uptime: process.uptime(),
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }
}