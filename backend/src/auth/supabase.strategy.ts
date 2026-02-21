import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['RS256', 'ES256'],
    });

    console.log('SupabaseStrategy: Initialized with JWKS endpoint:', `${supabaseUrl}/auth/v1/.well-known/jwks.json`);
  }

  /**
   * Validates the JWT payload from Supabase.
   * Maps the Supabase 'sub' (UUID) to the local user record.
   *
   * @param payload - The decoded JWT payload.
   * @returns The user object from the local DB or a mock user if not yet synced.
   */
  async validate(payload: any) {
    console.log('SupabaseStrategy.validate - Payload:', JSON.stringify(payload, null, 2));

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    // If user doesn't exist in local DB yet, they must be synced first or are new
    if (!user) {
      // Return a partial user object that allows the sync endpoint to fire
      return {
        id: payload.sub,
        email: payload.email || payload.user_metadata?.email,
        role: 'MEMBER',
        status: 'APPROVED', // Temporarily allow to let the sync/manual endpoint run
        user_metadata: payload.user_metadata,
      };
    }

    if (user.status === 'PENDING') {
      throw new UnauthorizedException(
        'Your account is pending administrator approval.',
      );
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedException(
        'Your account has been rejected or suspended.',
      );
    }

    return user;
  }
}
