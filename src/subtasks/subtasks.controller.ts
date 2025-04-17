import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskGuard } from './guards/task-id.guard';

@UseGuards(JwtAuthGuard, TaskGuard)
@Controller('tasks/:taskId/subtasks')
export class SubtasksController {}
