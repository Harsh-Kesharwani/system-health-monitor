import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Alert, AlertType, AlertStatus } from './entities/alert.entity';
import { MetricsService } from '../metrics/metrics.service';
import { CreateAlertThresholdDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private thresholds: Map<AlertType, { threshold: number; message: string }> =
    new Map();

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private metricsService: MetricsService,
  ) {
    // Default thresholds
    this.thresholds.set(AlertType.CPU, {
      threshold: 80,
      message: 'CPU usage is high',
    });
    this.thresholds.set(AlertType.MEMORY, {
      threshold: 80,
      message: 'Memory usage is high',
    });
    this.thresholds.set(AlertType.DISK, {
      threshold: 90,
      message: 'Disk usage is high',
    });
  }

  async findAll(status?: AlertStatus): Promise<Alert[]> {
    const query = this.alertRepository
      .createQueryBuilder('alert')
      .orderBy('alert.createdAt', 'DESC');

    if (status) {
      query.where('alert.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }
    return alert;
  }

  async setThreshold(
    createAlertThresholdDto: CreateAlertThresholdDto,
  ): Promise<void> {
    const { type, threshold, message } = createAlertThresholdDto;
    this.thresholds.set(type, {
      threshold,
      message: message || this.getDefaultMessage(type),
    });
    this.logger.log(`Set ${type} threshold to ${threshold}%`);
  }

  getThresholds(): Map<AlertType, { threshold: number; message: string }> {
    return new Map(this.thresholds);
  }

  getDefaultMessage(type: AlertType): string {
    switch (type) {
      case AlertType.CPU:
        return 'CPU usage is high';
      case AlertType.MEMORY:
        return 'Memory usage is high';
      case AlertType.DISK:
        return 'Disk usage is high';
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkThresholds() {
    const metrics = await this.metricsService.getLatestMetrics();

    this.checkMetric(AlertType.CPU, metrics.cpuUsage);
    this.checkMetric(AlertType.MEMORY, metrics.memoryUsage);
    this.checkMetric(AlertType.DISK, metrics.diskUsage);

    await this.resolveFixedAlerts(metrics);
  }

  private async checkMetric(type: AlertType, value: number) {
    const config = this.thresholds.get(type);
    if (!config) return;

    if (value > config.threshold) {
      const existingAlert = await this.alertRepository.findOne({
        where: { type, status: AlertStatus.ACTIVE },
      });

      if (!existingAlert) {
        const alert = new Alert();
        alert.type = type;
        alert.threshold = config.threshold;
        alert.value = value;
        alert.message = config.message;
        await this.alertRepository.save(alert);
        this.logger.warn(
          `Alert triggered: ${type} at ${value.toFixed(1)}% (threshold: ${config.threshold}%)`,
        );
        this.sendNotification(alert);
      } else {
        existingAlert.value = value;
        await this.alertRepository.save(existingAlert);
      }
    }
  }

  private async resolveFixedAlerts(metrics: any) {
    const activeAlerts = await this.alertRepository.find({
      where: { status: AlertStatus.ACTIVE },
    });

    for (const alert of activeAlerts) {
      let currentValue: number;

      switch (alert.type) {
        case AlertType.CPU:
          currentValue = metrics.cpuUsage;
          break;
        case AlertType.MEMORY:
          currentValue = metrics.memoryUsage;
          break;
        case AlertType.DISK:
          currentValue = metrics.diskUsage;
          break;
      }

      if (currentValue < alert.threshold) {
        alert.status = AlertStatus.RESOLVED;
        alert.resolvedAt = new Date();
        await this.alertRepository.save(alert);
        this.logger.log(
          `Alert resolved: ${alert.type} at ${currentValue.toFixed(1)}% (threshold: ${alert.threshold}%)`,
        );
      }
    }
  }

  private sendNotification(alert: Alert) {
    // For now, just log to console
    // In a real system, this could send emails, webhooks, etc.
    this.logger.warn(
      `[ALERT] ${alert.message}: ${alert.type} is at ${alert.value.toFixed(1)}% (threshold: ${alert.threshold}%)`,
    );
  }
}
