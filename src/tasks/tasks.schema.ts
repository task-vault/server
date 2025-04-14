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

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  created_at: timestamp('created_at', {
    mode: 'date',
    precision: 0,
  })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date', precision: 0 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));
