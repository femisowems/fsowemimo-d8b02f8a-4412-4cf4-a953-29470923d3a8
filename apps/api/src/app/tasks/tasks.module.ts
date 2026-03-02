import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task, AuditLog } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module'; // for guards/auth services if exported


@Module({
    imports: [
        TypeOrmModule.forFeature([Task, AuditLog]),
        AuthModule
    ],
    providers: [TasksService], // Provided via AuthModule now
    controllers: [TasksController],
})
export class TasksModule { }
