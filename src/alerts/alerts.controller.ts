import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertStatus } from './entities/alert.entity';
import { CreateAlertThresholdDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('alerts')
@Controller('api/alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  @ApiQuery({ name: 'status', enum: AlertStatus, required: false })
  @ApiResponse({ status: 200, description: 'Return all alerts' })
  findAll(@Query('status') status?: AlertStatus) {
    return this.alertsService.findAll(status);
  }

  @Get('thresholds')
  @ApiOperation({ summary: 'Get all alert thresholds' })
  @ApiResponse({ status: 200, description: 'Return all alert thresholds' })
  // eslint-disable-next-line @typescript-eslint/require-await
  async getThresholds() {
    const thresholds = Object.fromEntries(this.alertsService.getThresholds());
    return { thresholds };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by id' })
  @ApiResponse({ status: 200, description: 'Return the alert' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(+id);
  }

  @Post('thresholds')
  @ApiOperation({ summary: 'Set alert threshold' })
  @ApiResponse({
    status: 201,
    description: 'The threshold has been successfully set',
  })
  setThreshold(@Body() createAlertThresholdDto: CreateAlertThresholdDto) {
    return this.alertsService.setThreshold(createAlertThresholdDto);
  }
}
