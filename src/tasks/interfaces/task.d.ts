import { tasks } from '../tasks.schema';
import { SubtaskResponse, Subtask } from '../../subtasks/interfaces/subtask';

export type Task = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
export type TaskWithSubtask = typeof tasks.$inferSelect & {
  subtasks: Subtask[];
};
export type TaskResponse = Omit<
  Task,
  'userId' | 'created_at' | 'updated_at'
> & {
  subtasks: SubtaskResponse[];
};
