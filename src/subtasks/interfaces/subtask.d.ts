import { subtasks } from '../subtasks.schema';

export type Subtask = typeof subtasks.$inferSelect;
export type SubtaskInsert = typeof subtasks.$inferInsert;
export type SubtaskResponse = Omit<
  Subtask,
  'taskId' | 'created_at' | 'updated_at'
>;
