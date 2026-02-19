import { Module } from '@nestjs/common';
import { UserStoriesService } from './user-stories.service';
import { UserStoriesController } from './user-stories.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [UserStoriesController],
  providers: [UserStoriesService],
  exports: [UserStoriesService],
})
export class UserStoriesModule {}
