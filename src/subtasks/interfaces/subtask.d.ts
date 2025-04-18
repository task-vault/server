import { subtasks } from '../subtasks.schema';

export type Subtask = typeof subtasks.$inferSelect;
export type SubtaskInsert = typeof subtasks.$inferInsert;
