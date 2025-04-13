import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle.schema';

export type TSchema = typeof schema;
export type TDatabase = NodePgDatabase<TSchema> & {
  $client: Pool;
};

@Injectable()
export class DrizzleService implements OnModuleInit {
  db: TDatabase;

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
    this.db = drizzle<TSchema>(pool, { schema });

    await this.db.$client.connect();
  }
}
