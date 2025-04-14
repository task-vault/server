import {
  uuid,
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../users/users.schema';
import { timestamps } from '../drizzle/helpers/timestamps.schema';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  deadline: timestamp('deadline', {
    mode: 'date',
    precision: 0,
  }),
  ...timestamps,
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));
