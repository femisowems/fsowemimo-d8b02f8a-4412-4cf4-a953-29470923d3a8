import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  User,
  Organization,
  Team,
  Task,
  AuditLog,
  Permission,
} from '@secure-task-management/data';
import { UserRole } from '@secure-task-management/data/enums';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const entities = [User, Organization, Team, Task, AuditLog, Permission];

const AppDataSource = new DataSource({
  type: (process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite') as any,
  url: process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL : undefined,
  database: process.env.DATABASE_URL?.startsWith('postgres')
    ? undefined
    : process.env.DATABASE_URL || 'database.sqlite',
  entities,
  synchronize: true,
  logging: true,
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const orgRepo = AppDataSource.getRepository(Organization);
    const userRepo = AppDataSource.getRepository(User);

    // 1. Create Default Organization
    let mainOrg = await orgRepo.findOne({ where: { name: 'Main Organization' } });
    if (!mainOrg) {
      mainOrg = orgRepo.create({
        name: 'Main Organization',
        settings: { theme: 'light', allowSignup: true },
      });
      await orgRepo.save(mainOrg);
      console.log('Created Main Organization');
    }

    // 2. Create Admin User (Example)
    const adminEmail = 'admin@example.com';
    let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      adminUser = userRepo.create({
        email: adminEmail,
        name: 'System Admin',
        role: UserRole.ADMIN,
        organizationId: mainOrg.id,
        emailVerified: true,
        preferences: {},
      });
      await userRepo.save(adminUser);
      console.log('Created System Admin');
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
