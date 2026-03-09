import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Team,
  Organization,
  User,
} from '@secure-task-management/data';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, Organization, User]),
    AuditModule,
    AuthModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService]
})
export class TeamsModule {}
