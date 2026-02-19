import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
