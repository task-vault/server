import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { decrypt } from '../utils/refreshToken-encryption';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const encryptionKey = configService.getOrThrow<string>(
      'JWT_REFRESH_ENCRYTPION_KEY',
    );
    const encryptionIV = configService.getOrThrow<string>(
      'JWT_REFRESH_ENCRYTPION_IV',
    );
    const refreshSecret =
      configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const refreshToken = request.cookies?.Refresh as string;
          if (!refreshToken) return null;

          const decryptedToken = decrypt(
            refreshToken,
            encryptionKey,
            encryptionIV,
          );

          return decryptedToken;
        },
      ]),
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    return await this.authService.validateRefreshToken(
      request.cookies?.Refresh as string,
      payload.userId,
    );
  }
}
