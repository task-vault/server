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
import { Task, TaskInsert, TaskResponse } from './interfaces/task';
import { StateValidationPipe } from './pipes/state.pipe';
import { State } from './interfaces/state-param';
import { CreateTaskRequest } from './dto/create-task.request';
import { UpdateTaskRequest } from './dto/update-task.request';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/interfaces/user';
import { DeleteTasksRequest } from './dto/delete-tasks.request';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks(@CurrentUser() user: User) {
    return await this.tasksService.getAll(user.id);
  }

  @UseGuards(TaskGuard)
  @Get(':taskId')
  async getSingleTask(@TaskId() taskId: Task['id']) {
    return (await this.tasksService.getSingle(taskId)) as TaskResponse;
  }

  @UseGuards(TaskGuard)
  @Get(':taskId/progress')
  async getTaskProgress(@TaskId() taskId: Task['id']) {
    return await this.tasksService.getProgress(taskId);
  }

  @Get('state/:state')
  async getTasksByState(
    @CurrentUser() user: User,
    @Param('state', StateValidationPipe) state: State,
  ) {
    return await this.tasksService.getByState(user.id, state);
  }

  @Post()
  async createTask(@CurrentUser() user: User, @Body() task: CreateTaskRequest) {
    const taskData: TaskInsert = {
      ...task,
      userId: user.id,
    };

    return await this.tasksService.create(taskData);
  }

  @UseGuards(TaskGuard)
  @Patch(':taskId')
  async updateTask(
    @CurrentUser() user: User,
    @TaskId() taskId: Task['id'],
    @Body() task: UpdateTaskRequest,
  ) {
    const taskData: TaskInsert = {
      ...task,
      userId: user.id,
    };

    return await this.tasksService.update(taskId, taskData);
  }

  @UseGuards(TaskGuard)
  @HttpCode(204)
  @Delete(':taskId')
  async deleteTask(@TaskId() taskId: Task['id']) {
    return await this.tasksService.delete(taskId);
  }

  @UseGuards(TaskGuard)
  @HttpCode(200)
  @Post(':taskId/complete')
  async completeTask(@TaskId() taskId: Task['id']) {
    return await this.tasksService.toggleCompleted(taskId, true);
  }

  @UseGuards(TaskGuard)
  @HttpCode(200)
  @Post(':taskId/uncomplete')
  async uncompleteTask(@TaskId() taskId: Task['id']) {
    return await this.tasksService.toggleCompleted(taskId, false);
  }

  @HttpCode(204)
  @Delete()
  async deleteTasks(
    @CurrentUser() user: User,
    @Body() body: DeleteTasksRequest,
  ) {
    return await this.tasksService.deleteMany(user.id, body.taskIds);
  }
}
