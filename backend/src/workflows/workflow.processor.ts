import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../database/prisma.service';

@Processor('workflow-queue')
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Main processing loop for workflow jobs.
   * Iterates through actions and maintains the execution log.
   *
   * @param job - The BullMQ job containing workflow data.
   * @returns A promise that resolves when all actions are attempted.
   */
  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing workflow job: ${job.name} (Job ID: ${job.id})`);
    const { workflowId, context, actions } = job.data;

    try {
      for (const action of actions) {
        this.logger.log(`Executing action: ${action.type}`);

        let result;
        let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';

        try {
          if (action.type === 'HTTP_REQUEST') {
            result = await this.handleHttpRequest(action.config, context);
          } else {
            this.logger.warn(`Unknown action type: ${action.type}`);
            result = { error: `Unknown action type: ${action.type}` };
            status = 'FAILED';
          }
        } catch (e) {
          result = { error: e.message };
          status = 'FAILED';
          throw e; // Re-throw to trigger retry
        } finally {
          // Log the attempt
          await this.prisma.actionLog.create({
            data: {
              actionId: action.id,
              status,
              details: result || {},
            },
          });
        }
      }
      this.logger.log(`Workflow ${workflowId} completed successfully.`);
    } catch (error) {
      this.logger.error(
        `Workflow ${workflowId} failed: ${error.message}`,
        error.stack,
      );
      throw error; // BullMQ will handle retries if configured
    }
  }

  /**
   * Executes an HTTP request action.
   *
   * @param config - The action configuration (URL, method, etc).
   * @param context - The event context (e.g., task details).
   * @returns The request result status and data.
   */
  private async handleHttpRequest(config: any, context: any) {
    const { url, method, headers, body } = config;

    // Simple template replacement (e.g. {{taskId}} -> context.id)
    // For now, we just send the context as the body if no body is provided
    const data = body || context;

    const response = await axios({
      method: method || 'POST',
      url,
      headers: headers || {},
      data,
    });

    this.logger.log(
      `HTTP Request to ${url} succeeded. Status: ${response.status}`,
    );
    return { status: response.status, data: response.data };
  }
}
