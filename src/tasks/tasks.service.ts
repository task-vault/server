import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Task, TaskInsert } from './interfaces/task';
import { State } from './interfaces/state-param';
import { tasks } from './tasks.schema';

@Injectable()
export class TasksService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAll(userId: string) {
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

  async getSingle(id: Task['id']) {
    const task = await this.drizzleService.db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, id),
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return {
      ...task,
      userId: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
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

    return filteredTasks.map((task) => {
      return {
        ...task,
        userId: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
    });
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
      throw new Error('Failed to create task');
    }

    return {
      ...newTask,
      userId: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }
}
