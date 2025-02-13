import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('metrics')
@Controller('api/metrics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get latest system metrics' })
  @ApiResponse({ status: 200, description: 'Return the latest system metrics' })
  getLatestMetrics() {
    return this.metricsService.getLatestMetrics();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get historical system metrics' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return historical system metrics' })
  getMetricsHistory(@Query('limit') limit: number) {
    return this.metricsService.getMetricsHistory(limit);
  }
}
