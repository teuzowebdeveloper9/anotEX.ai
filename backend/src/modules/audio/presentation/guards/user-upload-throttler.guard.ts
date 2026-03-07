import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthenticatedRequest } from './auth.guard.js';

@Injectable()
export class UserUploadThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const user = (req as AuthenticatedRequest).user;
    return user?.id ?? req.ip ?? 'anonymous';
  }
}
