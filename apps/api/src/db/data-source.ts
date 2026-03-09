import { DataSource } from 'typeorm';
import {
  User,
  Organization,
  Team,
  Task,
  AuditLog,
  Permission,
} from '@secure-task-management/data';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export default new DataSource({
  type: (process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite') as any,
  url: process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL : undefined,
  database: process.env.DATABASE_URL?.startsWith('postgres')
    ? undefined
    : process.env.DATABASE_URL || 'database.sqlite',
  entities: [User, Organization, Team, Task, AuditLog, Permission],
  migrations: [resolve(__dirname, 'migrations/*.ts')],
  synchronize: false, // Essential for migrations
  logging: true,
});
