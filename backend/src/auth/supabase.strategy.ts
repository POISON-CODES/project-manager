import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get<string>('SUPABASE_URL')}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['RS256'],
    });
  }

  /**
   * Validates the JWT payload from Supabase.
   * Maps the Supabase 'sub' (UUID) to the local user record.
   * 
   * @param payload - The decoded JWT payload.
   * @returns The user object from the local DB or a mock user if not yet synced.
   */
  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    // If user doesn't exist in local DB yet, they must be synced first or are new
    if (!user) {
      // Allow only if the webhook hasn't processed it yet but maybe they just signed up
      // For strict approval, we might want to throw if not in local DB
      return { id: payload.sub, email: payload.email, role: 'MEMBER', status: 'PENDING' };
    }

    if (user.status === 'PENDING') {
      throw new UnauthorizedException('Your account is pending administrator approval.');
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedException('Your account has been rejected or suspended.');
    }

    return user;
  }
}
