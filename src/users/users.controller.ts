import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user.request';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './interfaces/user';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.login(user, response);
    response.status(200);
    return {
      ...user,
      password: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return {
      message: 'Logout successful',
    };
  }
}
