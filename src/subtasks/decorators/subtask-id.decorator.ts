import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getSubtaskId = (req: ExecutionContext): number => {
  const request = req.switchToHttp().getRequest<{ subtaskId: number }>();
  return request.subtaskId;
};

export const SubtaskId = createParamDecorator(
  (_data: unknown, req: ExecutionContext) => {
    return getSubtaskId(req);
  },
);
