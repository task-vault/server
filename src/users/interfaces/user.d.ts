import { users } from '../users.schema';

export type User = typeof users.$inferSelect;
