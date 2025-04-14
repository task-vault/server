import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tasks } from '../tasks/tasks.schema';
import { timestamps } from '../drizzle/helpers/timestamps.schema';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  refreshToken: text('refreshToken'),
  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));
