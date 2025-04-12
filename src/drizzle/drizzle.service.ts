import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle.schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private db: ReturnType<typeof drizzle> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const pool = new Pool({
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      database: this.configService.get<string>('DB_NAME'),
      ssl: {
        rejectUnauthorized: true,
        ca: this.configService.get<string>('DB_CERT'),
      },
    });
    this.db = drizzle(pool, { schema });

    await this.db.$client.connect();
  }

  onModuleDestroy() {
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }
}
