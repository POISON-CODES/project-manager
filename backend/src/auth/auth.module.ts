import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule, DatabaseModule],
  controllers: [AuthController],
  providers: [SupabaseStrategy, AuthService],
  exports: [PassportModule, SupabaseStrategy, AuthService],
})
export class AuthModule {}
