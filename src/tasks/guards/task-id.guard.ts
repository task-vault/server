import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from '../tasks.service';
import { User } from '../../users/interfaces/user';

export type TaskIdRequest = Request & {
  params: {
    taskId: string;
  };
  taskId: number;
  user: User;
};

@Injectable()
export class TaskGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const taskId = this.getTaskId(request);

    const task = await this.tasksService.getSingle(taskId);

    if (task.userId !== request.user.id) {
      throw new UnauthorizedException();
    }

    request.taskId = taskId;
    return true;
  }

  private getRequest(context: ExecutionContext): TaskIdRequest {
    return context.switchToHttp().getRequest<TaskIdRequest>();
  }

  private getTaskId(request: TaskIdRequest): number {
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
