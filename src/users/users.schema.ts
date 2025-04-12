import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
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
