import { IsEnum } from 'class-validator';
import { TaskStatus } from './enums';

export class PatchTaskStatusDto {
    @IsEnum(TaskStatus)
    status!: TaskStatus;
}
