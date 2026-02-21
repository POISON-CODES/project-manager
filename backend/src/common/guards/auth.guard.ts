import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if a request should be allowed based on JWT presence and '@Public()' metadata.
   *
   * @param context - Execution context of the request.
   * @returns Boolean indicating whether the request is allowed.
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  /**
   * Custom handleRequest to log errors if authentication fails.
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('JwtAuthGuard Failure:', {
        error: err?.message || err,
        info: info?.message || info,
        user: !!user
      });
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
