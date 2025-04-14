import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from './users.schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { User, UserInsert } from './interfaces/user';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(req: UserInsert): Promise<Partial<User>> {
    const { firstName, lastName, email, password } = req;

    const existingUser = await this.drizzleService.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    if (existingUser) {
      throw new BadRequestException(['A user with this email already exists']);
    }

    const hashedPassword = await hash(password, 10);
    if (!hashedPassword) {
      throw new InternalServerErrorException(['Failed to secure password']);
    }

    const user = (
      await this.drizzleService.db
        .insert(schema.users)
        .values({
          firstName,
          lastName,
          email,
          password: hashedPassword,
        })
        .returning()
    ).at(0);
    if (!user) {
      throw new InternalServerErrorException(['Failed to create user']);
    }

    return {
      ...user,
      password: undefined,
      refreshToken: undefined,
    };
  }

  async getUser(userId?: string, email?: string): Promise<User> {
    if (!userId && !email) {
      throw new InternalServerErrorException(['No id or email provided']);
    }

    const user = await this.drizzleService.db.query.users.findFirst({
      where: (users, { eq }) => {
        if (userId) {
          return eq(users.id, userId);
        }
        return eq(users.email, email as string);
      },
    });
    if (!user) {
      throw new UnauthorizedException(['Invalid credentials']);
    }

    return user;
  }

  async setRefreshToken(
    userId: string,
    refreshToken: UserInsert['refreshToken'],
  ) {
    if (!userId || !refreshToken) {
      throw new InternalServerErrorException([
        'No userId OR refresh token provided',
      ]);
    }

    const updatedUser = (
      await this.drizzleService.db
        .update(schema.users)
        .set({ refreshToken })
        .where(eq(schema.users.id, userId))
        .returning()
    ).at(0);
    if (!updatedUser) {
      throw new InternalServerErrorException([
        'Failed to create refresh tokoen for the user',
      ]);
    }
  }

  async revokeRefreshToken(userId: string) {
    if (!userId) {
      throw new InternalServerErrorException(['No userId provided']);
    }

    const updatedUser = (
      await this.drizzleService.db
        .update(schema.users)
        .set({ refreshToken: null })
        .where(eq(schema.users.id, userId))
        .returning()
    ).at(0);
    if (!updatedUser) {
      throw new InternalServerErrorException([
        'Failed to revoke refresh token for the user',
      ]);
    }
  }
}
