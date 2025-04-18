import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { User, UserInsert } from './interfaces/user';
import { formatUser } from './utils/formatUser';
import { users } from './users.schema';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getSingle(userId?: string, email?: string): Promise<User> {
    if (!userId && !email) {
      throw new InternalServerErrorException(['No id or email provided']);
    }

    const user = await this.drizzleService.db.query.users.findFirst({
      where: () => {
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

  async create(req: UserInsert) {
    const existingUser = await this.drizzleService.db.query.users.findFirst({
      where: () => eq(users.email, req.email),
    });
    if (existingUser) {
      throw new BadRequestException(['A user with this email already exists']);
    }

    const hashedPassword = await hash(req.password, 10);
    if (!hashedPassword) {
      throw new InternalServerErrorException(['Failed to secure password']);
    }

    const [newUser] = await this.drizzleService.db
      .insert(users)
      .values({
        ...req,
        password: hashedPassword,
      })
      .returning();
    if (!newUser) {
      throw new InternalServerErrorException(['Failed to create user']);
    }

    return formatUser(newUser);
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

    const [updatedUser] = await this.drizzleService.db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, userId))
      .returning();
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

    const [updatedUser] = await this.drizzleService.db
      .update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, userId))
      .returning();
    if (!updatedUser) {
      throw new InternalServerErrorException([
        'Failed to revoke refresh token for the user',
      ]);
    }
  }
}
