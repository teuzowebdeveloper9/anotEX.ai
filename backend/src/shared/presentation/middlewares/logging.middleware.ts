import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method } = req;
    // Loga apenas o pathname — a query string pode conter segredos (ex: webhookSecret)
    const path = req.originalUrl.split('?')[0];
    const start = Date.now();

    this.logger.log(`--> ${method} ${path}`);

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
      this.logger[level](`<-- ${method} ${path} ${statusCode} ${ms}ms`);
    });

    next();
  }
}
