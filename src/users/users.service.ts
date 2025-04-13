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

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(req: typeof schema.users.$inferInsert) {
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

    const user = await this.drizzleService.db
      .insert(schema.users)
      .values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      })
      .returning();
    return {
      ...user[0],
      password: undefined,
      refreshToken: undefined,
    };
  }

  async getUser(
    id?: string,
    email?: string,
  ): Promise<typeof schema.users.$inferSelect> {
    if (!id && !email) {
      throw new InternalServerErrorException(['No id or email provided']);
    }

    const user = await this.drizzleService.db.query.users.findFirst({
      where: (users, { eq }) => {
        if (id) {
          return eq(users.id, id);
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
    id: string,
    refreshToken: (typeof schema.users.$inferInsert)['refreshToken'],
  ) {
    if (!id || !refreshToken) {
      throw new BadRequestException(['No id or refresh token provided']);
    }

    await this.drizzleService.db
      .update(schema.users)
      .set({ refreshToken })
      .where(eq(schema.users.id, id));
  }

  async revokeRefreshToken(id: string) {
    if (!id) {
      throw new BadRequestException(['No id provided']);
    }
    await this.drizzleService.db
      .update(schema.users)
      .set({ refreshToken: null })
      .where(eq(schema.users.id, id));
  }
}
