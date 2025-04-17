import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from '../../tasks/tasks.service';

type TaskIdRequest = Request & {
  params: {
    taskId: string;
  };
  taskId: number;
};

@Injectable()
export class TaskGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const taskId = this.getTaskId(request);

    await this.tasksService.getSingle(Number(taskId));

    request.taskId = taskId;
    return true;
  }

  getRequest(context: ExecutionContext): TaskIdRequest {
    return context.switchToHttp().getRequest<TaskIdRequest>();
  }

  getTaskId(request: TaskIdRequest): number {
    try {
      const { taskId } = request.params;
      const parsedTaskId = Number(taskId);

      if (
        isNaN(parsedTaskId) ||
        parsedTaskId <= 0 ||
        !Number.isInteger(parsedTaskId)
      ) {
        throw new Error();
      }

      return parsedTaskId;
    } catch {
      throw new BadRequestException(
        'Validation failed - taskId must be a positive integer',
      );
    }
  }
}
