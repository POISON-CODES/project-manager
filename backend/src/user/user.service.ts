import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find all users in the workspace.
     * 
     * @returns List of users with basic info.
     */
    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Update user role or status.
     * 
     * @param id - User UUID.
     * @param data - { role?, status? }
     * @returns Updated user.
     */
    async update(id: string, data: { role?: any; status?: any }) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    /**
     * Find a specific user by ID.
     * 
     * @param id - User UUID.
     * @returns User details.
     */
    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
}
