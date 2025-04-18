/* eslint-disable @typescript-eslint/require-await */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskGuard } from './guards/task-id.guard';
import { TaskId } from './decorators/task-id.decorator';
import { Task } from './interfaces/task';
import { StateValidationPipe } from './pipes/state.pipe';
import { State } from './interfaces/state-param';
import { CreateTaskRequest } from './dto/create-task.request';
import { UpdateTaskRequest } from './dto/update-task.request';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/interfaces/user';
import { DeleteTasksRequest } from './dto/delete-tasks.request';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor() {}

  @Get()
  async getAllTasks(@CurrentUser() user: User) {
    return `All tasks retrieved successfully for user ${user.id}`;
  }

  @UseGuards(TaskGuard)
  @Get(':taskId')
  async getSingleTask(@TaskId() taskId: Task['id']) {
    return `Task with ID ${taskId} retrieved successfully`;
  }

  @UseGuards(TaskGuard)
  @Get(':taskId/progress')
  async getTaskProgress(@TaskId() taskId: Task['id']) {
    return `Progress of task with ID ${taskId} retrieved successfully`;
  }

  @Get('state/:state')
  async getTasksByState(
    @CurrentUser() user: User,
    @Param('state', StateValidationPipe) state: State,
  ) {
    return `Tasks with state ${state} retrieved successfully for user ${user.id}`;
  }

  @Post()
  async createTask(@CurrentUser() user: User, @Body() task: CreateTaskRequest) {
    return `Task with title ${task.title} created successfully for user ${user.id}`;
  }

  @UseGuards(TaskGuard)
  @Patch(':taskId')
  async updateTask(
    @CurrentUser() user: User,
    @TaskId() taskId: Task['id'],
    @Body() task: UpdateTaskRequest,
  ) {
    return `Task with ID ${taskId} updated successfully ${task.title} for user ${user.id}`;
  }

  @UseGuards(TaskGuard)
  @HttpCode(204)
  @Delete(':taskId')
  async deleteTask(@TaskId() taskId: Task['id']) {
    return `Task with ID ${taskId} deleted successfully`;
  }

  @UseGuards(TaskGuard)
  @HttpCode(200)
  @Post(':taskId/complete')
  async completeTask(@TaskId() taskId: Task['id']) {
    return `Task with ID ${taskId} marked as completed successfully`;
  }

  @UseGuards(TaskGuard)
  @HttpCode(200)
  @Post(':taskId/uncomplete')
  async uncompleteTask(@TaskId() taskId: Task['id']) {
    return `Task with ID ${taskId} marked as uncompleted successfully`;
  }

  @HttpCode(204)
  @Delete()
  async deleteTasks(
    @CurrentUser() user: User,
    @Body() body: DeleteTasksRequest,
  ) {
    return `Tasks with IDs [${body.taskIds.join(', ')}] deleted successfully for user ${user.id}`;
  }
}
