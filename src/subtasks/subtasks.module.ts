import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { SubtasksController } from './subtasks.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [DrizzleModule, TasksModule],
  providers: [SubtasksService],
  controllers: [SubtasksController],
})
export class SubtasksModule {}
