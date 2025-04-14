import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/interfaces/user.d';
import { State } from './interfaces/state-param';
import { CreateTaskRequest } from './dto/create-task.request';
import { Task } from './interfaces/task';
import { StateValidationPipe } from './pipes/state.pipe';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(@CurrentUser() user: User) {
    return await this.tasksService.getAll(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTask(@Param('id', ParseIntPipe) id: Task['id']) {
    return await this.tasksService.getSingle(id);
  }

  @Get('/state/:state')
  @UseGuards(JwtAuthGuard)
  async getTaskByState(
    @CurrentUser() user: User,
    @Param('state', new StateValidationPipe()) state: State,
  ) {
    return await this.tasksService.getByState(user.id, state);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTask(@CurrentUser() user: User, @Body() task: CreateTaskRequest) {
    return await this.tasksService.create(user.id, task);
  }
}
