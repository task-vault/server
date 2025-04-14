import { Controller, Get, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/interfaces/user';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(@CurrentUser() user: User) {
    return await this.tasksService.getAll(user.id);
  }

  @Get('completed')
  @UseGuards(JwtAuthGuard)
  async getCompletedTasks(@CurrentUser() user: User) {
    return await this.tasksService.getCompleted(user.id);
  }

  @Get('incompleted')
  @UseGuards(JwtAuthGuard)
  async getIncompletedTasks(@CurrentUser() user: User) {
    return await this.tasksService.getIncompleted(user.id);
  }
}
