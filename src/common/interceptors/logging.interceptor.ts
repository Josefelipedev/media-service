import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = user?.userId || 'anonymous';

    const now = Date.now();

    this.logger.log(`[${userId}] ${method} ${url} - ${userAgent} ${ip}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const contentLength = response.get('content-length');

          this.logger.log(
            `[${userId}] ${method} ${url} ${statusCode} ${contentLength || 0} - ${Date.now() - now}ms`,
          );
        },
        error: (error) => {
          this.logger.error(
            `[${userId}] ${method} ${url} - Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
