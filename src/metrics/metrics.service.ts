/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as os from 'os';
import { Metric } from './entities/metric.entity';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
  ) {}

  async getLatestMetrics(): Promise<Metric> {
    const metrics = await this.metricRepository.find({
      order: { timestamp: 'DESC' },
      take: 1,
    });
    return metrics[0] || this.collectMetrics();
  }

  async getMetricsHistory(limit: number = 100): Promise<Metric[]> {
    return this.metricRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async collectAndSaveMetrics() {
    const metrics = this.collectMetrics();
    await this.metricRepository.save(metrics);
    this.logger.debug('Metrics saved');
  }

  collectMetrics(): Metric {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpuUsage = this.getCpuUsage();

    // Get disk usage (for root directory in Linux/Mac or C: in Windows)
    const diskUsage = this.getDiskUsage();

    const metric = new Metric();
    metric.cpuUsage = cpuUsage;
    metric.memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    metric.diskUsage = diskUsage;

    return metric;
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    return 100 - (idle / total) * 100;
  }

  private getDiskUsage(): number {
    try {
      if (process.platform === 'win32') {
        // For Windows - simplified approach
        const drive = 'C:';
        const { stdout } = require('child_process').execSync(
          `wmic logicaldisk where DeviceID="${drive}" get Size,FreeSpace /format:csv`,
          { encoding: 'utf8' },
        );

        const lines = stdout.trim().split('\n');
        if (lines.length > 1) {
          const [, freeSpace, size] = lines[1].split(',');
          return 100 - (parseInt(freeSpace) / parseInt(size)) * 100;
        }
        return 0;
      } else {
        // For Linux/Mac
        const { stdout } = require('child_process').execSync('df -k /', {
          encoding: 'utf8',
        });


        const lines = stdout?.trim()?.split('\n');
        if (lines?.length > 1) {
          const stats = lines[1].split(/\s+/);
          const used = parseInt(stats[2]);
          const total = parseInt(stats[1]);
          return (used / total) * 100;
        }
        return 0;
      }
    } catch (error) {
      this.logger.error(`Error getting disk usage: ${error?.message}`);
      return 0;
    }
  }
}
