import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/interfaces/user';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload';
import { decrypt, encrypt } from './utils/refreshToken-encryption';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private isProduction() {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  async login(user: User, response: Response, shouldRemember: boolean) {
    const payload: TokenPayload = { userId: user.id };
    const isProduction = this.isProduction();

    const { accessToken, maxAge } = this.generateAccessToken(payload);
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: isProduction,
      maxAge: shouldRemember ? maxAge : undefined,
    });

    if (!shouldRemember) {
      response.clearCookie('Refresh', {
        httpOnly: true,
        secure: isProduction,
      });
      return;
    }

    const { refreshToken, expires } = await this.generateRefreshToken(
      user,
      payload,
    );
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: isProduction,
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
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
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
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const encryptionKey = this.configService.getOrThrow<string>(
      'JWT_REFRESH_ENCRYTPION_KEY',
    );
    const encryptionIV = this.configService.getOrThrow<string>(
      'JWT_REFRESH_ENCRYTPION_IV',
    );

    if (user.refreshToken) {
      const decryptedRefreshToken = decrypt(
        user.refreshToken,
        encryptionKey,
        encryptionIV,
      );
      const payload: TokenPayload = this.jwtService.verify<TokenPayload>(
        decryptedRefreshToken,
        {
          secret: refreshSecret,
        },
      );
      if (!payload || payload.userId !== user.id) {
        await this.usersService.revokeRefreshToken(user.id);
        throw new UnauthorizedException(['Invalid refresh token']);
      }

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
      secret: refreshSecret,
      expiresIn: `${refreshExpirationMS}ms`,
    });
    const encryptedRefreshToken = encrypt(
      refreshToken,
      encryptionKey,
      encryptionIV,
    );
    await this.usersService.setRefreshToken(user.id, encryptedRefreshToken);

    const expirationDate = new Date(Date.now());
    expirationDate.setMilliseconds(
      expirationDate.getMilliseconds() + refreshExpirationMS,
    );

    return { refreshToken: encryptedRefreshToken, expires: expirationDate };
  }

  async logout(response: Response, userId: string) {
    await this.usersService.revokeRefreshToken(userId);
    const isProduction = this.isProduction();

    response.clearCookie('Authentication', {
      httpOnly: true,
      secure: isProduction,
    });

    response.clearCookie('Refresh', {
      httpOnly: true,
      secure: isProduction,
    });
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.getSingle(undefined, email);
      if (!user) {
        throw new Error();
      }

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new Error();
      }

      return user;
    } catch {
      throw new UnauthorizedException(['Invalid credentials']);
    }
  }

  async validateRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getSingle(userId);
      if (!user.refreshToken) {
        throw new Error();
      }

      if (user.refreshToken !== refreshToken) {
        throw new Error();
      }

      return user;
    } catch {
      throw new UnauthorizedException(['Invalid refresh token']);
    }
  }
}
