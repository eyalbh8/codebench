import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { AppLogger } from './app-logger.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLogger,
    private readonly cls: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl;

    this.cls.set('path', url);
    if (method !== 'GET' && method !== 'OPTIONS') {
      this.logger.log(`Request started [${method}] ${url}`);
    }
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;

        if (method !== 'GET' && method !== 'OPTIONS') {
          this.logger.log(`Request completed with duration ${duration}ms`);
        }
      }),
      catchError((err) => {
        const duration = Date.now() - now;

        this.logger.error(`Request failed with duration ${duration}ms ${err}`);

        throw err;
      }),
    );
  }
}
