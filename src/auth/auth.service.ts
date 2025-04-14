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

    const { accessToken, maxAge } = this.generateAccessToken(payload);
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: shouldRemember ? maxAge : undefined,
    });

    if (!shouldRemember) {
      response.clearCookie('Refresh', {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
      });
      return;
    }

    const { refreshToken, expires } = await this.generateRefreshToken(
      user,
      payload,
    );
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      expires,
    });
  }

  private generateAccessToken(payload: TokenPayload): {
    accessToken: string;
    maxAge: number;
  } {
    const accessExpirationMS = this.configService.getOrThrow<number>(
      'JWT_ACCESS_EXPIRATION',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${accessExpirationMS}ms`,
    });

    return { accessToken, maxAge: accessExpirationMS };
  }

  private async generateRefreshToken(
    user: User,
    payload: TokenPayload,
  ): Promise<{ refreshToken: string; expires: Date }> {
    const refreshExpirationMS = this.configService.getOrThrow<number>(
      'JWT_REFRESH_EXPIRATION',
    );

    if (user.refreshToken) {
      const expirationTime = user.updated_at.getTime() + refreshExpirationMS;
      const currentTime = new Date(Date.now()).getTime();

      const expirationDate = new Date(user.updated_at);
      expirationDate.setMilliseconds(
        expirationDate.getMilliseconds() + refreshExpirationMS,
      );

      if (currentTime < expirationTime) {
        return { refreshToken: user.refreshToken, expires: expirationDate };
      }

      await this.usersService.revokeRefreshToken(user.id);
    }

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${refreshExpirationMS}ms`,
    });
    await this.usersService.setRefreshToken(user.id, refreshToken);

    const expirationDate = new Date(Date.now());
    expirationDate.setMilliseconds(
      expirationDate.getMilliseconds() + refreshExpirationMS,
    );

    return { refreshToken, expires: expirationDate };
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
      if (!user) {
        throw new UnauthorizedException();
      }

      const authenticated = await compare(password, user.password);

      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException(['Invalid credentials']);
    }
  }

  async validateRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser(userId);
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }
      return user;
    } catch {
      throw new UnauthorizedException(['Invalid refresh token']);
    }
  }
}
