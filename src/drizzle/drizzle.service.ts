import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle.schema';

@Injectable()
export class DrizzleService implements OnModuleInit {
  private db: ReturnType<typeof drizzle> | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
    this.db = drizzle(pool, { schema });
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }
}
