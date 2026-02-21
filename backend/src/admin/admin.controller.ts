import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, TaskStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  /**
   * Get dynamic column headers for Kanban boards.
   * In the future, this could return different stages based on project types.
   *
   * @returns Array of stage metadata.
   */
  @Roles(UserRole.ADMIN, UserRole.PROJECT_LEAD)
  @Get('stages')
  async getStages() {
    // For now, return the mapping of TaskStatus as the default headers
    // In a real scenario, this could be queried from the database per project type
    const stages = [
      { id: TaskStatus.TODO, label: 'To Do', color: '#64748b' },
      { id: TaskStatus.IN_PROGRESS, label: 'In Progress', color: '#3b82f6' },
      { id: TaskStatus.REVIEW, label: 'Review', color: '#f59e0b' },
      { id: TaskStatus.DONE, label: 'Completed', color: '#10b981' },
      { id: TaskStatus.HALTED, label: 'Halted', color: '#ef4444' },
    ];

    return {
      success: true,
      data: stages,
    };
  }

  /**
   * Get the permission matrix for the current user's role.
   */
  @Get('permissions')
  async getPermissions(@Request() req: any) {
    const role = req.user.role as UserRole;

    const rolePermissions = {
      [UserRole.ADMIN]: {
        projects: ['create', 'read', 'update', 'delete', 'assign'],
        tasks: ['create', 'read', 'update', 'delete', 'assign'],
        users: ['create', 'read', 'update', 'delete'],
        workflows: ['manage'],
      },
      [UserRole.PROJECT_LEAD]: {
        projects: ['read', 'update', 'assign'],
        tasks: ['create', 'read', 'update', 'delete', 'assign'],
        users: ['read'],
        workflows: ['view'],
      },
      [UserRole.MEMBER]: {
        projects: ['read'],
        tasks: ['read', 'update-status', 'comment'],
        users: ['read'],
        workflows: [],
      },
      [UserRole.STAKEHOLDER]: {
        projects: ['read'],
        tasks: ['read', 'comment'],
        users: [],
        workflows: [],
      },
    };

    return {
      success: true,
      data: rolePermissions[role] || rolePermissions[UserRole.MEMBER],
    };
  }
}
