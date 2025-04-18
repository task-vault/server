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

type ReturnTask = Omit<Task, 'created_at' | 'updated_at'>;

@Injectable()
export class TasksService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private formatTask(task: Task): ReturnTask {
    const formattedTask: ReturnTask = {
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      completed: task.completed,
      deadline: task.deadline,
    };

    return formattedTask;
  }

  async getAll(userId: User['id']) {
    const tasks: Task[] = await this.drizzleService.db.query.tasks.findMany({
      where: (tasks, { eq }) => eq(tasks.userId, userId),
    });

    return tasks.map((task) => this.formatTask(task));
  }

  async getSingle(taskId: Task['id']) {
    const task = await this.drizzleService.db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, taskId),
    });
    if (!task) {
      throw new NotFoundException([`Task with id ${taskId} not found`]);
    }

    return this.formatTask(task);
  }

  async getByState(userId: string, state: State) {
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

    return filteredTasks.map((task) => this.formatTask(task));
  }

  async create(userId: string, task: Omit<TaskInsert, 'userId'>) {
    const data: TaskInsert = {
      ...task,
      deadline: task.deadline ? new Date(task.deadline) : null,
      userId,
    };
    const newTask = (
      await this.drizzleService.db.insert(tasks).values(data).returning()
    ).at(0);
    if (!newTask) {
      throw new InternalServerErrorException(['Failed to create task']);
    }

    return this.formatTask(newTask);
  }

  async toggleComplete(taskId: Task['id'], completed: boolean) {
    const updatedTask = (
      await this.drizzleService.db
        .update(tasks)
        .set({ completed })
        .where(eq(tasks.id, taskId))
        .returning()
    ).at(0);
    if (!updatedTask) {
      throw new NotFoundException([`Task with id ${taskId} not found`]);
    }

    return this.formatTask(updatedTask);
  }

  async delete(taskId: Task['id']) {
    const deletedTask = (
      await this.drizzleService.db
        .delete(tasks)
        .where(eq(tasks.id, taskId))
        .returning()
    ).at(0);
    if (!deletedTask) {
      throw new NotFoundException([`Task with id ${taskId} not found`]);
    }
  }
}
