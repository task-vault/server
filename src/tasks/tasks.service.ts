import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Task, TaskInsert } from './interfaces/task';
import { State } from './interfaces/state-param';
import { tasks } from './tasks.schema';
import { eq } from 'drizzle-orm';
import { User } from '../users/interfaces/user';
import { formatTask } from './utils/formatTask';

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

  async getByState(userId: string, state: State): Promise<Partial<Task>[]> {
    const tasks = await this.drizzleService.db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId),
      with: {
        subtasks: true,
      },
    });

    const filteredTasks = tasks.filter((task) => {
      switch (state) {
        case 'completed':
          return task.completed === true;
        case 'pending':
          return task.completed === false;
        case 'overdue':
          return !task.completed && task.deadline && task.deadline < new Date();
        default:
          return true;
      }
    });

    return filteredTasks.map((task) => formatTask(task));
  }

  async create(userId: string, task: Omit<TaskInsert, 'userId'>) {
    const data: TaskInsert = {
      ...task,
      deadline: task.deadline ? new Date(task.deadline) : null,
      userId,
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

  async toggleComplete(taskId: Task['id'], completed: boolean) {
    const [updatedTask] = await this.drizzleService.db
      .update(tasks)
      .set({ completed })
      .where(eq(tasks.id, taskId))
      .returning();
    if (!updatedTask) {
      throw new NotFoundException([`Task with id ${taskId} not found`]);
    }

    return await this.getSingle(taskId);
  }

  async delete(taskId: Task['id']) {
    const [deletedTask] = await this.drizzleService.db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning();
    if (!deletedTask) {
      throw new NotFoundException([`Task with id ${taskId} not found`]);
    }
  }
}
