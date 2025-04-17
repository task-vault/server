import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TasksService } from '../../tasks/tasks.service';

@Injectable()
export class TaskGuard implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    try {
      const { taskId } = request.params;
      if (!taskId || isNaN(Number(taskId))) {
        throw new Error();
      }

      const task = await this.tasksService.getSingle(Number(taskId));
      if (!task) {
        throw new Error();
      }
    } catch {
      return false;
    }

    return true;
  }

  getRequest(context: ExecutionContext): Request {
    return context.switchToHttp().getRequest<Request>();
  }
}
