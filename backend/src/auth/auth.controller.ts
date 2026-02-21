import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { type SignupDto, SignupSchema } from './dto/signup.dto';
import { type LoginDto, LoginSchema } from './dto/login.dto';

import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) { }

  /**
   * Authenticates a user using email and password via Supabase.
   * Both email and password are required.
   *
   * @param body - The login credentials (email and password).
   * @returns The Supabase authentication response containing the session and user data.
   * @throws UnauthorizedException if authentication fails.
   */
  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  /**
   * Registers a new user via Supabase and synchronizes the record to the local database.
   * All parameters (email, password, name, phoneNumber) are mandatory.
   *
   * @param body - The user registration data.
   * @returns The Supabase signup response.
   * @throws UnauthorizedException if registration fails.
   */
  @Public()
  @Post('signup')
  @UsePipes(new ZodValidationPipe(SignupSchema))
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  /**
   * Manually triggers a synchronization of the currently authenticated user's data from Supabase.
   * This endpoint is a fallback mechanism in case the automated sync fails or is delayed.
   *
   * @param req - The request object containing the authenticated user from the JwtAuthGuard.
   * @returns A success status and the synchronized user data.
   */
  @UseGuards(JwtAuthGuard)
  @Post('sync/manual')
  async syncManual(@Request() req: any) {
    const user = req.user;
    this.logger.log(
      `Manual sync request for ID: ${user.id} (Email fallback: ${user.email})`,
    );

    const syncedUser = await this.authService.syncUserManual({
      id: user.id,
      email: user.email || user.user_metadata?.email || '',
      name:
        user.name || user.user_metadata?.name || user.user_metadata?.full_name,
      avatarUrl:
        user.avatarUrl ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture,
      phone: user.phoneNumber || user.phone || user.user_metadata?.phone,
    });

    return {
      success: true,
      data: syncedUser,
    };
  }
}
