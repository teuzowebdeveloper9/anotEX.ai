import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

// Apenas captura erros internos (5xx) com stack trace detalhado.
// O log de request/response completo (incluindo 4xx) fica no LoggingMiddleware.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      catchError((err: unknown) => {
        const ms = Date.now() - start;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`${method} ${url} ${ms}ms | ${message}`, err instanceof Error ? err.stack : undefined);
        return throwError(() => err);
      }),
    );
  }
}
