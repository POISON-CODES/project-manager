import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
/**
 * Decorator to specify required roles for a route.
 * Works in conjunction with RolesGuard.
 * 
 * @param roles - List of UserRole allowed to access the route.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
