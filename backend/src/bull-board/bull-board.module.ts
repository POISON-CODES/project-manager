import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    WorkflowsModule,
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'workflow-queue',
      adapter: BullMQAdapter,
    }),
  ],
})
export class BullBoardConfigModule {}
