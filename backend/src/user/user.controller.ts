import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
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
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    const data = await this.userService.update(id, { status });
    return { success: true, data };
  }

  /**
   * Update user role (Admin only).
   */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: any,
  ) {
    const data = await this.userService.update(id, { role });
    return { success: true, data };
  }
}
