import { Injectable } from '@nestjs/common';
import { DrizzleService, TDatabase } from '../drizzle/drizzle.service';

@Injectable()
export class UsersService {
  db: TDatabase;
  constructor(private readonly drizzleService: DrizzleService) {
    this.db = this.drizzleService.getDb();
  }
}
