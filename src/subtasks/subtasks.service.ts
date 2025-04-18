import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Subtask, SubtaskInsert } from './interfaces/subtask';
import { subtasks } from './subtasks.schema';
import { sql, eq, inArray, and } from 'drizzle-orm';
import { formatSubtask } from './utils/formatSubtask';

@Injectable()
export class SubtasksService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private async checkDuplicateSubtask(subtask: SubtaskInsert) {
    const existingSubtask =
      await this.drizzleService.db.query.subtasks.findFirst({
        where: () =>
          and(
            eq(subtasks.taskId, subtask.taskId),
            eq(sql`lower(${subtasks.title})`, subtask.title.toLowerCase()),
          ),
      });

    if (existingSubtask) {
      throw new BadRequestException([
        `Subtask with title ${subtask.title} already exists on this task`,
      ]);
    }
  }

  async getSingle(subtaskId: Subtask['id']) {
    const subtask = await this.drizzleService.db.query.subtasks.findFirst({
      where: eq(subtasks.id, subtaskId),
    });
    if (!subtask) {
      throw new NotFoundException([
        `Subtask with id ${subtaskId} not found on this task`,
      ]);
    }

    return subtask;
  }

  async create(subtask: SubtaskInsert) {
    await this.checkDuplicateSubtask(subtask);

    const [newSubtask] = await this.drizzleService.db
      .insert(subtasks)
      .values(subtask)
      .returning();
    if (!newSubtask) {
      throw new InternalServerErrorException(['Failed to create subtask']);
    }

    return formatSubtask(newSubtask);
  }

  async update(
    subtaskId: Subtask['id'],
    subtask: SubtaskInsert | { completed: SubtaskInsert['completed'] },
  ) {
    if ('title' in subtask) {
      await this.checkDuplicateSubtask(subtask);
    }

    const [updatedSubtask] = await this.drizzleService.db
      .update(subtasks)
      .set(subtask)
      .where(eq(subtasks.id, subtaskId))
      .returning();
    if (!updatedSubtask) {
      throw new InternalServerErrorException(['Failed to update subtask']);
    }

    return formatSubtask(updatedSubtask);
  }

  async delete(subtaskId: Subtask['id']) {
    const [deletedSubtask] = await this.drizzleService.db
      .delete(subtasks)
      .where(eq(subtasks.id, subtaskId))
      .returning();
    if (!deletedSubtask) {
      throw new InternalServerErrorException(['Failed to delete subtask']);
    }
  }

  async deleteMany(taskId: Subtask['taskId'], subtaskIds: Subtask['id'][]) {
    await this.drizzleService.db.transaction(async (tx) => {
      const deletedSubtasks = await tx
        .delete(subtasks)
        .where(
          and(eq(subtasks.taskId, taskId), inArray(subtasks.id, subtaskIds)),
        )
        .returning();

      if (deletedSubtasks.length !== subtaskIds.length) {
        try {
          tx.rollback();
        } catch {
          const notFoundIds = subtaskIds.filter(
            (id) => !deletedSubtasks.some((subtask) => subtask.id === id),
          );
          throw new NotFoundException([
            `Subtasks with ids [${notFoundIds.join(', ')}] not found on this task`,
          ]);
        }
      }
    });
  }

  async completeMany(taskId: Subtask['taskId'], subtaskIds: Subtask['id'][]) {
    const updated = await this.drizzleService.db.transaction(async (tx) => {
      const updatedSubtasks = await tx
        .update(subtasks)
        .set({ completed: true })
        .where(
          and(inArray(subtasks.id, subtaskIds), eq(subtasks.taskId, taskId)),
        )
        .returning();

      if (updatedSubtasks.length !== subtaskIds.length) {
        try {
          tx.rollback();
        } catch {
          const notFoundIds = subtaskIds.filter(
            (id) => !updatedSubtasks.some((subtask) => subtask.id === id),
          );
          throw new NotFoundException([
            `Subtasks with ids [${notFoundIds.join(', ')}] not found on this task`,
          ]);
        }
      }

      return updatedSubtasks;
    });

    return updated.map((subtask) => formatSubtask(subtask));
  }
}
