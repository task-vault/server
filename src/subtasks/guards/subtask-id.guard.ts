import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SubtasksService } from '../subtasks.service';
import { TaskIdRequest } from 'src/tasks/guards/task-id.guard';

export type SubtaskIdRequest = TaskIdRequest & {
  params: {
    subtaskId: string;
  };
  subtaskId: number;
};

@Injectable()
export class SubtaskGuard implements CanActivate {
  constructor(private readonly subtasksService: SubtasksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const subtaskId = this.getSubtaskId(request);

    const subtask = await this.subtasksService.getSingle(subtaskId);
    if (subtask.taskId !== request.taskId) {
      throw new UnauthorizedException();
    }

    request.subtaskId = subtaskId;
    return true;
  }

  private getRequest(context: ExecutionContext): SubtaskIdRequest {
    return context.switchToHttp().getRequest<SubtaskIdRequest>();
  }

  private getSubtaskId(request: SubtaskIdRequest): number {
    try {
      const { subtaskId } = request.params;
      const parsedSubtaskId = Number(subtaskId);

      if (
        isNaN(parsedSubtaskId) ||
        parsedSubtaskId <= 0 ||
        !Number.isInteger(parsedSubtaskId)
      ) {
        throw new Error();
      }

      return parsedSubtaskId;
    } catch {
      throw new BadRequestException(
        'Validation failed - subtaskId must be a positive integer',
      );
    }
  }
}
