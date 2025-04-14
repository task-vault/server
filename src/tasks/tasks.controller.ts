import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/interfaces/user.d';
import { State, states } from './interfaces/state-param.d';
import { CreateTaskRequest } from './dto/create-task.request';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(@CurrentUser() user: User) {
    return await this.tasksService.getAll(user.id);
  }

  @Get(':state')
  @UseGuards(JwtAuthGuard)
  async getTaskByState(
    @CurrentUser() user: User,
    @Param('state') state: State,
  ) {
    if (!states.includes(state)) {
      throw new BadRequestException('Invalid state parameter');
    }

    return await this.tasksService.getByState(user.id, state);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTask(@CurrentUser() user: User, @Body() task: CreateTaskRequest) {
    return await this.tasksService.create(user.id, task);
  }
}
