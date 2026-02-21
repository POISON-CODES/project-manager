import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Checks if the authenticated user has the required roles defined on the route.
   *
   * @param context - Execution context containing the request and user.
   * @returns Boolean indicating whether the user possesses a required role.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    // Assuming SupabaseStrategy returns the full user object from DB
    // If not, we check user.role from the payload if available, or fail.

    if (!user || !user.role) {
      // If user is not found or has no role
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
