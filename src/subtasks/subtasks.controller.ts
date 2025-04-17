import {
  Body,
  Controller,
  Delete,
  HttpCode,
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
import { TaskId } from './decorators/task-id.decorator';

@UseGuards(JwtAuthGuard, TaskGuard)
@Controller('tasks/:taskId/subtasks')
export class SubtasksController {
  constructor() {}

  @Post()
  createSubtask(
    @Body() subtask: CreateSubtaskRequest,
    @TaskId() taskId: number,
  ) {
    return {
      message: 'Subtask created successfully',
      subtask,
      taskId,
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

  @HttpCode(200) //! Change to 204
  @Delete(':subtaskId')
  deleteSubtask(@Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id']) {
    return {
      message: 'Subtask deleted successfully',
      subtaskId,
    };
  }

  @HttpCode(200) //! Change to 204
  @Delete()
  deleteSubtasks(@Body() subtaskIds: DeleteSubtasksRequest) {
    return {
      message: 'Subtasks deleted successfully',
      subtaskIds: subtaskIds.subtaskIds,
    };
  }

  @HttpCode(200)
  @Post(':subtaskId/complete')
  completeSubtask(@Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id']) {
    return {
      message: 'Subtask completed successfully',
      subtaskId,
    };
  }

  @HttpCode(200)
  @Post(':subtaskId/uncomplete')
  uncompleteSubtask(
    @Param('subtaskId', ParseIntPipe) subtaskId: Subtask['id'],
  ) {
    return {
      message: 'Subtask uncompleted successfully',
      subtaskId,
    };
  }

  @HttpCode(200)
  @Post('complete')
  completeSubtasks(@Body() subtaskIds: CompleteSubtasksRequest) {
    return {
      message: 'Subtasks completed successfully',
      subtaskIds: subtaskIds.subtaskIds,
    };
  }
}
