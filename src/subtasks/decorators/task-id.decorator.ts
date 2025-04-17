import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getTaskId = (req: ExecutionContext): number => {
  const request = req.switchToHttp().getRequest<{ taskId: number }>();
  return request.taskId;
};

export const TaskId = createParamDecorator(
  (_data: unknown, req: ExecutionContext) => {
    return getTaskId(req);
  },
);
