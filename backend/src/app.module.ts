import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envSchema } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FormsModule } from './forms/forms.module';
import { ProjectsModule } from './projects/projects.module';
import { UserStoriesModule } from './user-stories/user-stories.module';
import { TasksModule } from './tasks/tasks.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AdminModule } from './admin/admin.module';
import { BullBoardConfigModule } from './bull-board/bull-board.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { SearchModule } from './search/search.module';
import { CalendarModule } from './calendar/calendar.module';
import { StagesModule } from './stages/stages.module';
import { SupabaseModule } from './common/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    FormsModule,
    ProjectsModule,
    UserStoriesModule,
    TasksModule,
    WorkflowsModule,
    SearchModule,
    AdminModule,
    CalendarModule,
    StagesModule,
    SupabaseModule,
    BullBoardConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
