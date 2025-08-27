import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Service status',
    example: 'ok',
    enum: ['ok', 'error', 'degraded']
  })
  status: string;

  @ApiProperty({
    description: 'Current timestamp when health check was performed',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Name of the service',
    example: 'api-gateway'
  })
  service: string;

  @ApiProperty({
    description: 'Version of the service',
    example: '1.0.0'
  })
  version: string;

  @ApiProperty({
    description: 'Additional health check details',
    required: false,
    example: {
      uptime: '2h 30m 15s',
      memory: '45.2 MB',
      database: 'connected'
    }
  })
  details?: Record<string, any>;
}