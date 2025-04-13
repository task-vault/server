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

  login(user: User, response: Response) {
    const payload: TokenPayload = { userId: user.id };
    const expirationMS = this.configService.get<number>('JWT_EXPIRATION');

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: `${expirationMS}ms`,
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      maxAge: expirationMS,
    });
  }

  logout(response: Response) {
    response.clearCookie('Authentication', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });
    response.status(200);
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
}
