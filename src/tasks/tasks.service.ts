import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Task, TaskInsert, TaskResponse } from './interfaces/task';
import { State } from './interfaces/state-param';
import { tasks } from './tasks.schema';
import { and, eq, inArray } from 'drizzle-orm';
import { User } from '../users/interfaces/user';
import { formatTask } from './utils/formatTask';
import { isTaskOverdue } from './utils/isTaskOverdue';

@Injectable()
export class TasksService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAll(userId: User['id']) {
    const tasks = await this.drizzleService.db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId),
      with: {
        subtasks: true,
      },
    });

    return tasks.map((task) => formatTask(task));
  }

  async getSingle(taskId: Task['id'], wholeTask: boolean = false) {
    const task = await this.drizzleService.db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, taskId),
      with: {
        subtasks: true,
      },
    });
    if (!task) {
      throw new NotFoundException([`Task with id ${taskId} not found`]);
    }

    if (wholeTask) {
      return task as Task;
    }
    return formatTask(task);
  }

  async getProgress(taskId: Task['id']) {
    const task = (await this.getSingle(taskId)) as TaskResponse;
    if (!task.subtasks.length) {
      return { progress: 0 };
    }

    const completedSubtasks = task.subtasks.filter(
      (subtask) => subtask.completed,
    );
    const progress = Math.round(
      (completedSubtasks.length / task.subtasks.length) * 100,
    );
    return { progress };
  }

  async getByState(userId: User['id'], state: State) {
    const tasks = await this.drizzleService.db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId),
      with: {
        subtasks: true,
      },
    });

    const filteredTasks = tasks.filter((task) => {
      switch (state) {
        case 'completed':
          return task.completed;
        case 'pending':
          return !task.completed && !isTaskOverdue(task);
        case 'overdue':
          return isTaskOverdue(task);
        default:
          return false;
      }
    });

    return filteredTasks.map((task) => formatTask(task));
  }

  async create(task: TaskInsert) {
    const data: TaskInsert = {
      ...task,
      deadline: task.deadline ? new Date(task.deadline) : null,
    };
    const [newTask] = await this.drizzleService.db
      .insert(tasks)
      .values(data)
      .returning();
    if (!newTask) {
      throw new InternalServerErrorException(['Failed to create task']);
    }

    return formatTask({ ...newTask, subtasks: [] });
  }

  async update(
    taskId: Task['id'],
    task: TaskInsert | { completed: TaskInsert['completed'] },
  ) {
    const data = {
      ...task,
      deadline:
        'deadline' in task && task.deadline ? new Date(task.deadline) : null,
    };

    const [updatedTask] = await this.drizzleService.db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, taskId))
      .returning();
    if (!updatedTask) {
      throw new InternalServerErrorException([
        `Failed to update task with id ${taskId}`,
      ]);
    }

    return await this.getSingle(updatedTask.id);
  }

  async delete(taskId: Task['id']) {
    const [deletedTask] = await this.drizzleService.db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();
    if (!deletedTask) {
      throw new InternalServerErrorException([
        `Failed to delete task with id ${taskId}`,
      ]);
    }
  }

  async deleteMany(userId: User['id'], taskIds: Task['id'][]) {
    await this.drizzleService.db.transaction(async (tx) => {
      const deletedTasks = await tx
        .delete(tasks)
        .where(and(eq(tasks.userId, userId), inArray(tasks.id, taskIds)))
        .returning();

      if (deletedTasks.length !== taskIds.length) {
        try {
          tx.rollback();
        } catch {
          const notFoundIds = taskIds.filter(
            (id) => !deletedTasks.some((task) => task.id === id),
          );
          throw new NotFoundException([
            `Tasks with ids [${notFoundIds.join(', ')}] not found on this user`,
          ]);
        }
      }
    });
  }
}
