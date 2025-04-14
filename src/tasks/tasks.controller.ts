import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/interfaces/user.d';
import { State, states } from './interfaces/state-param.d';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(@CurrentUser() user: User) {
    return await this.tasksService.getAll(user.id);
  }

  @Get('/state')
  @UseGuards(JwtAuthGuard)
  async getByState(@CurrentUser() user: User, @Param('state') state: State) {
    if (!states.includes(state)) {
      throw new BadRequestException('Invalid state parameter');
    }

    return await this.tasksService.getByState(user.id, state);
  }
}
