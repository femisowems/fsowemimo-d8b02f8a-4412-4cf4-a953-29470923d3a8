import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Task,
  Organization,
  User,
  Team,
} from '@secure-task-management/data/entities';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module'; // for guards/auth services if exported
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Organization, User, Team]),
    AuditModule,
    AuthModule,
  ],
  providers: [TasksService], // Provided via AuthModule now
  controllers: [TasksController],
})
export class TasksModule {}
