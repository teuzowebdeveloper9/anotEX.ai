import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    this.logger.log(`--> ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`<-- ${method} ${url} ${ms}ms`);
      }),
      catchError((err: unknown) => {
        const ms = Date.now() - start;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`<-- ${method} ${url} ${ms}ms | ${message}`, err instanceof Error ? err.stack : undefined);
        return throwError(() => err);
      }),
    );
  }
}
