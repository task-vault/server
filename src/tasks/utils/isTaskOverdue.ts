import { Task } from '../interfaces/task';

export const isTaskOverdue = (task: Task): boolean => {
  const now = new Date();
  if (!task.deadline) {
    return false;
  }
  return task.deadline < now && !task.completed;
};
