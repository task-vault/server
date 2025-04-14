import { tasks } from '../tasks.schema';

export type Task = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
