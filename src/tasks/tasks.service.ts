import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  constructor() {}

  async getAll(userId: string) {
    // Simulate fetching tasks from a database
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: 'Task 1', userId },
          { id: 2, title: 'Task 2', userId },
        ]);
      }, 1000);
    });
  }

  async getCompleted(userId: string) {
    // Simulate fetching completed tasks from a database
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: 'Completed Task 1', userId },
          { id: 2, title: 'Completed Task 2', userId },
        ]);
      }, 1000);
    });
  }

  async getIncompleted(userId: string) {
    // Simulate fetching incompleted tasks from a database
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: 'Incompleted Task 1', userId },
          { id: 2, title: 'Incompleted Task 2', userId },
        ]);
      }, 1000);
    });
  }
}
