import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowProcessor } from './workflow.processor';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'workflow-queue',
    }),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowProcessor],
  exports: [WorkflowsService, BullModule],
})
export class WorkflowsModule { }
