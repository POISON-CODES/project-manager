import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Syncs user data from Supabase Auth webhook.
   * Handles INSERT and UPDATE events to keep the local user table in sync.
   * 
   * @param body - The webhook payload from Supabase.
   * @param signature - The x-supabase-signature (or custom header) for verification.
   * @returns Success status.
   */
  @Post('sync')
  async syncUser(
    @Body() body: any,
    @Headers('x-webhook-secret') secret: string,
  ) {
    const requiredSecret = this.configService.get<string>('AUTH_WEBHOOK_SECRET');

    if (requiredSecret && secret !== requiredSecret) {
      this.logger.warn(`Unauthorized sync attempt from ${secret}`);
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const { type, record } = body;
    this.logger.log(`Received auth webhook: ${type}`);

    if (type === 'INSERT' || type === 'UPDATE') {
      const user = record;
      // Sync to local DB
      await this.prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.raw_user_meta_data?.name || user.email.split('@')[0],
          phoneNumber: user.phone || user.raw_user_meta_data?.phone || '0000000000',
          avatarUrl: user.raw_user_meta_data?.avatar_url,
          updatedAt: new Date(),
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.raw_user_meta_data?.name || user.email.split('@')[0],
          phoneNumber: user.phone || user.raw_user_meta_data?.phone || '0000000000',
          avatarUrl: user.raw_user_meta_data?.avatar_url,
          role: UserRole.MEMBER,
          status: 'PENDING',
        },
      });
      this.logger.log(`Synced user: ${user.id}`);
    }

    return { success: true };
  }
}
