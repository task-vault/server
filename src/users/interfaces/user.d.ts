import { users } from '../users.schema';

export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserResponse = Omit<User, 'password' | 'refreshToken'>;
