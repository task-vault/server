import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tasks } from '../tasks/tasks.schema';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  refreshToken: text('refreshToken'),
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

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));
