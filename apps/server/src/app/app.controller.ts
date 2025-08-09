import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'API health check',
    description: 'Returns the health status of the main API for monitoring purposes and service discovery.'
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy and running',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Welcome to the MEAN Assessment API'
        },
        status: {
          type: 'string',
          example: 'healthy'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z'
        },
        version: {
          type: 'string',
          example: '1.0.0'
        }
      }
    }
  })
  @Get()
  getData() {
    return this.appService.getData();
  }
}
