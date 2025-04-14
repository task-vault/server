import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
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
};
