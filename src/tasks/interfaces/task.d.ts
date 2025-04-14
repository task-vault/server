import { tasks } from '../tasks.schema';

export type Task = typeof tasks.$inferSelect;
