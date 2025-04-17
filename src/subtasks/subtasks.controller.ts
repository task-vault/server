import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskGuard } from './guards/task-id.guard';
import { CreateSubtaskRequest } from './dto/create-subtask.request';
import { UpdateSubtaskRequest } from './dto/update-subtask.request';
import { Subtask } from './interfaces/subtask';
import { DeleteSubtasksRequest } from './dto/delete-subtasks.request';
import { CompleteSubtasksRequest } from './dto/complete-subtasks.request';

@UseGuards(JwtAuthGuard, TaskGuard)
@Controller('tasks/:taskId/subtasks')
export class SubtasksController {
  constructor() {}

  @Post()
  createSubtask(@Body() subtask: CreateSubtaskRequest) {
    return {
      message: 'Subtask created successfully',
      subtask,
    };
  }

  @Patch(':subtaskId')
  updateSubtask(
    @Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id'],
    @Body() subtask: UpdateSubtaskRequest,
  ) {
    return {
      message: 'Subtask updated successfully',
      subtaskId,
      subtask,
    };
  }

  @Delete(':subtaskId')
  deleteSubtask(@Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id']) {
    return {
      message: 'Subtask deleted successfully',
      subtaskId,
    };
  }

  @Delete()
  deleteSubtasks(@Body() subtaskIds: DeleteSubtasksRequest) {
    return {
      message: 'Subtasks deleted successfully',
      subtaskIds,
    };
  }

  @Post(':subtaskId/complete')
  completeSubtask(@Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id']) {
    return {
      message: 'Subtask completed successfully',
      subtaskId,
    };
  }

  @Post(':subtaskId/uncomplete')
  uncompleteSubtask(
    @Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id'],
  ) {
    return {
      message: 'Subtask uncompleted successfully',
      subtaskId,
    };
  }

  @Post('complete')
  completeSubtasks(@Body() subtaskIds: CompleteSubtasksRequest) {
    return {
      message: 'Subtasks completed successfully',
      subtaskIds,
    };
  }
}
