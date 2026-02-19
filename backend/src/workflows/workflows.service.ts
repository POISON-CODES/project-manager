import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('workflow-queue') private readonly workflowQueue: Queue,
  ) {}

  /**
   * Create a new automation rule.
   *
   * @param data - The workflow configuration.
   * @returns The created workflow.
   */
  async create(data: any) {
    return this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig || {},
        actions: {
          create: data.actions.map((action: any, index: number) => ({
            type: action.type,
            config: action.config,
            order: index,
          })),
        },
      },
      include: { actions: true },
    });
  }

  /**
   * Find all active workflows.
   *
   * @returns List of workflows.
   */
  async findAll() {
    return this.prisma.workflow.findMany({
      where: { isActive: true },
      include: { actions: true },
    });
  }

  /**
   * Trigger workflows based on an event.
   *
   * @param triggerType - The event type (e.g., 'TASK_COMPLETED').
   * @param context - Contextual data (e.g., the task object).
   */
  async trigger(triggerType: string, context: any) {
    this.logger.log(`Triggering workflows for type: ${triggerType}`);

    // 1. Find matching active workflows
    const workflows = await this.prisma.workflow.findMany({
      where: {
        triggerType,
        isActive: true,
      },
      include: { actions: true },
    });

    for (const workflow of workflows) {
      // 2. TODO: Implement triggerConfig filtering (e.g. "only if project status is X")

      // 3. Add job to queue
      await this.workflowQueue.add(
        workflow.name,
        {
          workflowId: workflow.id,
          context,
          actions: workflow.actions.sort((a, b) => a.order - b.order),
        },
        {
          attempts: 5, // Retry 5 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Initial delay 5s
          },
          removeOnComplete: true, // Keep Redis clean
          removeOnFail: false, // Keep failed jobs for inspection (DLQ concept)
        },
      );

      this.logger.log(`Queued workflow: ${workflow.name} (${workflow.id})`);
    }
  }
}
