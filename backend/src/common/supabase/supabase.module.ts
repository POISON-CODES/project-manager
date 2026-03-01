import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
    providers: [
        {
            provide: 'SUPABASE_CLIENT',
            inject: [ConfigService],
            useFactory: (configService: ConfigService): SupabaseClient => {
                const supabaseUrl = configService.get<string>('SUPABASE_URL')!;
                const supabaseKey = configService.get<string>('SUPABASE_KEY')!;
                return createClient(supabaseUrl, supabaseKey);
            },
        },
    ],
    exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule { }
