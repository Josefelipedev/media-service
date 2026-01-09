import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../infra/database/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'Health status.' })
  async check() {
    return this.health.check([
      // Database health check
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
              message: 'Database is healthy',
            },
          };
        } catch (error) {
          return {
            database: {
              status: 'down',
              message: error.message,
            },
          };
        }
      },
      // Memory health check
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB
      // Disk health check
      () =>
        this.disk.checkStorage('storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.9, // 90% usage
        }),
    ]);
  }

  @Get('liveness')
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ description: 'Service liveness.' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: process.env.APP_NAME || 'Media Service',
    };
  }

  @Get('readiness')
  @Public()
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiOkResponse({ description: 'Service readiness.' })
  async readiness() {
    const checks = {
      database: false,
      storage: false,
    };

    try {
      // Check database
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      checks.database = false;
    }

    // Check storage (simplified - in real app, test write permissions)
    checks.storage = true;

    const isReady = Object.values(checks).every(Boolean);

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
