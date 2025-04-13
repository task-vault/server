import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/interfaces/user';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response, shouldRemember: boolean) {
    const payload: TokenPayload = { userId: user.id };
    // ACCESS TOKEN LOGIC
    const accessExpirationMS = this.configService.getOrThrow<number>(
      'JWT_ACCESS_EXPIRATION',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${accessExpirationMS}ms`,
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: shouldRemember ? accessExpirationMS : undefined,
    });

    const refreshExpirationMS = this.configService.getOrThrow<number>(
      'JWT_REFRESH_EXPIRATION',
    );

    // REFRESH TOKEN LOGIC

    if (!shouldRemember) {
      response.clearCookie('Refresh', {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
      });
      return;
    }

    if (user.refreshToken) {
      const expirationTime = user.updated_at.getTime() + refreshExpirationMS;

      const expirationDate = new Date(user.updated_at);
      expirationDate.setMilliseconds(
        expirationDate.getMilliseconds() + refreshExpirationMS,
      );

      const currentTime = new Date(Date.now()).getTime();

      if (currentTime < expirationTime) {
        response.cookie('Refresh', user.refreshToken, {
          httpOnly: true,
          secure: this.configService.get<string>('NODE_ENV') === 'production',
          expires: expirationDate,
        });
        return;
      }
    }

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${refreshExpirationMS}ms`,
    });

    await this.usersService.setRefreshToken(user.id, refreshToken);

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: refreshExpirationMS,
    });
  }

  async logout(response: Response, userId: string) {
    await this.usersService.revokeRefreshToken(userId);

    response.clearCookie('Authentication', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    response.clearCookie('Refresh', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser(undefined, email);

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async verifyRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser(userId);
      console.log(user);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      return user;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
