import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps } from '../drizzle/helpers/timestamps.schema';
import { tasks } from '../tasks/tasks.schema';

export const subtasks = pgTable(
  'subtasks',
  {
    id: serial('id').primaryKey(),
    taskId: integer('taskId')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: boolean('completed').notNull().default(false),
    ...timestamps,
  },
  (subtasks) => [
    unique('unique_title_for_taskId').on(subtasks.taskId, subtasks.title),
  ],
);

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));
