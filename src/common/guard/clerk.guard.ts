import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ClerkService } from '../../clerk/clerk.service';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { getAuth } from '@clerk/express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(

    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const auth = getAuth(req);

    if (!auth.userId || !auth.isAuthenticated) {
      throw new UnauthorizedException('Unauthorized');
    }

    req.auth = {
      userId: auth.userId,
      sessionId: auth.sessionId,
  
    };

    return true;
  }
}