import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/interfaces/user';

const getCurrentUser = (req: ExecutionContext): User => {
  const request = req.switchToHttp().getRequest<{ user: User }>();
  return request.user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, req: ExecutionContext) => {
    return getCurrentUser(req);
  },
);
