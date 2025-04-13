import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from './users.schema';
import { hash } from 'bcryptjs';

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
    return user;
  }
}
