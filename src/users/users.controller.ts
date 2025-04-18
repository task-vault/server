import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user.request';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './interfaces/user';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../auth/guards/jwt-refresh.guard';
import { LoginUserRequest } from './dto/login-user.request';
import { formatUser } from './utils/formatUser';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() req: CreateUserRequest) {
    return await this.usersService.create(req);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Body() req: LoginUserRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response, req.shouldRemember);
    return formatUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.logout(response, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  session(@CurrentUser() user: User) {
    return formatUser(user);
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response, true);
    return formatUser(user);
  }
}
