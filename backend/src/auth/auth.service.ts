import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { type SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private supabase: SupabaseClient;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.supabase = createClient(
            this.configService.get<string>('SUPABASE_URL')!,
            this.configService.get<string>('SUPABASE_KEY')!,
        );
    }

    /**
     * Authenticates a user with Supabase using email and password.
     * Triggers a local database refresh on successful authentication.
     *
     * @param email - User's email address.
     * @param password - User's password (mandatory).
     * @returns The Supabase AuthResponse data.
     * @throws UnauthorizedException if credentials are invalid or Supabase returns an error.
     */
    async login(email: string, password: string) {
        this.logger.log(`Login attempt for: ${email}`);
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        const user = data.user;
        if (user) {
            this.logger.log(`Supabase login successful for id: ${user.id}. Refreshing local DB...`);
            try {
                await this.syncUserManual({
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.name,
                    avatarUrl: user.user_metadata?.avatar_url,
                    phone: user.phone,
                });
                this.logger.log(`Local DB refresh successful for id: ${user.id}`);
            } catch (syncError) {
                this.logger.error(`Local DB refresh failed for id: ${user.id}`, syncError.stack);
            }
        }

        return data;
    }

    /**
     * Handles the user signup process through Supabase.
     * Stores additional user metadata (name, role, phone) in Supabase and syncs the record locally.
     *
     * @param params - The user registration data (SignupDto).
     * @returns The Supabase AuthResponse data.
     * @throws UnauthorizedException if signup fails.
     */
    async signup(params: SignupDto) {
        this.logger.log(`Signup attempt for: ${params.email}`);

        const { data, error } = await this.supabase.auth.signUp({
            email: params.email,
            password: params.password,
            options: {
                data: {
                    name: params.name,
                    role: 'MEMBER',
                    phone: params.phoneNumber,
                },
            },
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        const user = data.user;
        let finalData = data;

        if (user) {
            this.logger.log(`Supabase signup successful for id: ${user.id}. Syncing to local DB...`);
            try {
                await this.syncUserManual({
                    id: user.id,
                    email: user.email!,
                    name: params.name,
                    avatarUrl: user.user_metadata?.avatar_url,
                    phone: params.phoneNumber,
                });
                this.logger.log(`Local DB sync successful for id: ${user.id}`);
            } catch (syncError) {
                this.logger.error(`Local DB sync failed for id: ${user.id}`, syncError.stack);
            }

            // If Supabase didn't return a session (which happens if confirmation is required), 
            // we'll try to sign in immediately to get a session for auto-login.
            if (!data.session) {
                this.logger.log(`No session returned from signup for ${user.id}. Attempting auto-login...`);
                try {
                    const loginResponse = await this.login(params.email, params.password);
                    finalData = loginResponse as any;
                } catch (loginError) {
                    this.logger.warn(`Auto-login after signup failed for ${user.id}: ${loginError.message}`);
                }
            }
        }

        return finalData;
    }

    /**
     * Manually synchronizes or creates a user record in the local database.
     * Uses Supabase user data as the source of truth for synchronization.
     *
     * @param userData - The user profile information to synchronize.
     * @returns The upserted user record from Prisma.
     */
    async syncUserManual(userData: {
        id: string;
        email: string;
        name?: string;
        avatarUrl?: string;
        phone?: string;
    }) {
        this.logger.log(`Performing manual sync for user: ${userData.id}`);

        return (this.prisma.user as any).upsert({
            where: { id: userData.id },
            update: {
                email: userData.email,
                name: userData.name || userData.email.split('@')[0],
                phoneNumber: userData.phone || null,
                avatarUrl: userData.avatarUrl || null,
                status: 'APPROVED', // Ensure user is approved on successful login/sync
                updatedAt: new Date(),
            },
            create: {
                id: userData.id,
                email: userData.email,
                name: userData.name || userData.email.split('@')[0],
                phoneNumber: userData.phone || null,
                avatarUrl: userData.avatarUrl || null,
                role: UserRole.MEMBER,
                status: 'APPROVED',
            },
        });
    }
}
