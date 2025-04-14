import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Task, TaskInsert } from './interfaces/task';
import { State } from './interfaces/state-param';
import { tasks } from './tasks.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAll(userId: string): Promise<Partial<Task>[]> {
    const tasks: Task[] = await this.drizzleService.db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId),
    });

    return tasks.map((task) => {
      return {
        ...task,
        userId: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
    });
  }

  async getSingle(taskId: Task['id']): Promise<Partial<Task>> {
    const task = await this.drizzleService.db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, taskId),
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return {
      ...task,
      userId: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }

  async getByState(userId: string, state: State): Promise<Partial<Task>[]> {
    const tasks: Task[] = await this.drizzleService.db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId),
    });

    const filteredTasks = tasks.filter((task) => {
      switch (state) {
        case 'completed':
          return task.completed === true;
        case 'pending':
          return task.completed === false;
        case 'overdue':
          return task.deadline && new Date(task.deadline) < new Date();
        default:
          return true;
      }
    });

    return filteredTasks.map((task) => {
      return {
        ...task,
        userId: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
    });
  }

  async create(
    userId: string,
    task: Omit<TaskInsert, 'userId'>,
  ): Promise<Partial<Task>> {
    const data: TaskInsert = {
      ...task,
      deadline: task.deadline ? new Date(task.deadline) : null,
      userId,
    };
    const newTask = (
      await this.drizzleService.db.insert(tasks).values(data).returning()
    ).at(0);
    if (!newTask) {
      throw new Error('Failed to create task');
    }

    return {
      ...newTask,
      userId: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }

  async toggleComplete(
    taskId: Task['id'],
    completed: boolean,
  ): Promise<Partial<Task>> {
    const updatedTask = (
      await this.drizzleService.db
        .update(tasks)
        .set({ completed })
        .where(eq(tasks.id, taskId))
        .returning()
    ).at(0);
    if (!updatedTask) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    return {
      ...updatedTask,
      userId: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }

  async delete(taskId: Task['id']) {
    const deletedTask = (
      await this.drizzleService.db
        .delete(tasks)
        .where(eq(tasks.id, taskId))
        .returning()
    ).at(0);
    if (!deletedTask) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }
  }
}
