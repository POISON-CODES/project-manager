import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Get the current authenticated user's profile.
   *
   * @param req - Request object containing the user set by SupabaseStrategy.
   * @returns The user object.
   */
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  /**
   * Get all users in the workspace.
   * Needed for user filters in Kanban and Gantt views.
   *
   * @returns Array of users.
   */
  @Get()
  async findAll() {
    const data = await this.userService.findAll();
    return {
      success: true,
      data,
    };
  }

  /**
   * Update user status (Admin only).
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    const data = await this.userService.update(id, { status });
    return { success: true, data };
  }

  /**
   * Get all users with stats for management (Admin/Project Lead only).
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_LEAD)
  @Get('management')
  async findAllForManagement() {
    const users = await this.userService.findAllWithStats();

    // Process stats on backend to simplify frontend
    const data = users.map((user: any) => {
      const activeProjects = user.ownedProjects.filter((p: any) =>
        !['Handover Complete', 'Cancelled'].includes(p.currentStage?.name)
      ).length +
        user.stakeholderProjects.filter((p: any) =>
          !['Handover Complete', 'Cancelled'].includes(p.currentStage?.name)
        ).length;

      const completedProjects = user.ownedProjects.filter((p: any) => p.currentStage?.name === 'Handover Complete').length +
        user.stakeholderProjects.filter((p: any) => p.currentStage?.name === 'Handover Complete').length;

      const activeTasks = user.assignedTasks.filter((t: any) => t.status !== 'DONE').length;
      const completedTasks = user.assignedTasks.filter((t: any) => t.status === 'DONE').length;

      return {
        ...user,
        stats: {
          activeProjects,
          completedProjects,
          activeTasks,
          completedTasks,
          totalTasks: user.assignedTasks.length,
          // For simplicity, stories count can be approximated or handled if needed
          activeStories: 0, // Would need more complex query or relations
        }
      };
    });

    return {
      success: true,
      data,
    };
  }

  /**
   * Update user role (Admin only).
   * Constraint: Admin cannot change the role of another admin.
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async updateRole(@Request() req: any, @Param('id') id: string, @Body('role') role: any) {
    // 1. Fetch the target user
    const targetUser = await this.userService.findOne(id);
    if (!targetUser) {
      return { success: false, message: 'User not found' };
    }

    // 2. Prevent editing another admin
    if (targetUser.role === UserRole.ADMIN && targetUser.id !== req.user.id) {
      return {
        success: false,
        message: 'Administrators cannot change the roles of other administrators.'
      };
    }

    // 3. Prevent self-demotion (optional, but good practice if not specified)
    // if (targetUser.id === req.user.id && role !== UserRole.ADMIN) {
    //   return { success: false, message: 'You cannot remove your own admin role.' };
    // }

    const data = await this.userService.update(id, { role });
    return { success: true, data };
  }

  /**
   * Get global activity feed (or filtered by user).
   * Supports ?userId=<uuid> to filter.
   */
  @Get('activity')
  async getActivity(@Query('userId') userId?: string) {
    // If userId query param is present, filter by it. Otherwise global.
    const activities = await this.userService.getActivities(userId, 50);
    return { success: true, data: activities };
  }

  @Patch('me/profile')
  async updateProfile(
    @Request() req: any,
    @Body('name') name: string,
    @Body('avatarUrl') avatarUrl: string,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    const data = await this.userService.update(req.user.id, {
      name,
      avatarUrl,
      phoneNumber,
    });
    return { success: true, data };
  }

  /**
   * Get detailed stats for a specific user (Admin/Lead only).
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_LEAD)
  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    const data = await this.userService.getUserStats(id);
    if (!data) {
      return { success: false, message: 'User not found' };
    }
    return { success: true, data };
  }

  /**
   * Invite/Create a new user (Admin/Lead only).
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_LEAD)
  @Post()
  async createUser(@Body() body: any) {
    const data = await this.userService.create(body);
    return { success: true, data };
  }
}
