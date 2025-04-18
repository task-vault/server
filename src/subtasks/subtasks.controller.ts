import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSubtaskRequest } from './dto/create-subtask.request';
import { UpdateSubtaskRequest } from './dto/update-subtask.request';
import { Subtask, SubtaskInsert } from './interfaces/subtask';
import { DeleteSubtasksRequest } from './dto/delete-subtasks.request';
import { CompleteSubtasksRequest } from './dto/complete-subtasks.request';
import { SubtasksService } from './subtasks.service';
import { TaskGuard } from '../tasks/guards/task-id.guard';
import { SubtaskId } from './decorators/subtask-id.decorator';
import { SubtaskGuard } from './guards/subtask-id.guard';
import { TaskId } from '../tasks/decorators/task-id.decorator';

@UseGuards(JwtAuthGuard, TaskGuard)
@Controller('/tasks/:taskId/subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Post()
  async createSubtask(
    @TaskId() taskId: Subtask['taskId'],
    @Body() subtask: CreateSubtaskRequest,
  ) {
    const subtaskData: SubtaskInsert = {
      ...subtask,
      taskId,
    };

    return await this.subtasksService.create(subtaskData);
  }

  @UseGuards(SubtaskGuard)
  @Patch(':subtaskId')
  async updateSubtask(
    @TaskId() taskId: Subtask['taskId'],
    @SubtaskId() subtaskId: Subtask['id'],
    @Body() subtask: UpdateSubtaskRequest,
  ) {
    const subtaskData: SubtaskInsert = {
      ...subtask,
      taskId,
    };

    return await this.subtasksService.update(subtaskId, subtaskData);
  }

  @UseGuards(SubtaskGuard)
  @HttpCode(204)
  @Delete(':subtaskId')
  async deleteSubtask(@SubtaskId() subtaskId: Subtask['id']) {
    return await this.subtasksService.delete(subtaskId);
  }

  @UseGuards(SubtaskGuard)
  @HttpCode(200)
  @Post(':subtaskId/complete')
  async completeSubtask(@SubtaskId() subtaskId: Subtask['id']) {
    return await this.subtasksService.update(subtaskId, {
      completed: true,
    });
  }

  @UseGuards(SubtaskGuard)
  @HttpCode(200)
  @Post(':subtaskId/uncomplete')
  async uncompleteSubtask(@SubtaskId() subtaskId: Subtask['id']) {
    return await this.subtasksService.update(subtaskId, {
      completed: false,
    });
  }

  @HttpCode(200)
  @Post('complete')
  async completeSubtasks(
    @TaskId() taskId: Subtask['taskId'],
    @Body() body: CompleteSubtasksRequest,
  ) {
    return await this.subtasksService.completeMany(taskId, body.subtaskIds);
  }

  @HttpCode(204)
  @Delete()
  async deleteSubtasks(
    @TaskId() taskId: Subtask['taskId'],
    @Body() body: DeleteSubtasksRequest,
  ) {
    return await this.subtasksService.deleteMany(taskId, body.subtaskIds);
  }
}
