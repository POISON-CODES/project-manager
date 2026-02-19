import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { UserStoriesModule } from '../user-stories/user-stories.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [UserStoriesModule, WorkflowsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
