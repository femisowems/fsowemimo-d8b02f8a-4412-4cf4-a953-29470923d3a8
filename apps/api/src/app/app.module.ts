import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AppController } from './app.controller';
import {
  User,
  Organization,
  Task,
  AuditLog,
  Permission,
  Team,
} from '@secure-task-management/data/entities';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
        return {
          type: (isPostgres ? 'postgres' : 'sqlite') as any,
          url: isPostgres ? process.env.DATABASE_URL : undefined,
          database: isPostgres
            ? undefined
            : process.env.DATABASE_URL || 'database.sqlite',
          entities: [User, Organization, Team, Task, AuditLog, Permission],
          synchronize: true, // Only for dev!
          logging: true,
          ssl: isPostgres ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    AuditModule,
    OrganizationsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TeamsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
