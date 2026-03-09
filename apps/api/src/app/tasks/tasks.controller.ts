import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // need to implement this file
import { RolesGuard } from '@secure-task-management/auth/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(@Inject(TasksService) private tasksService: TasksService) {}

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.tasksService.create(req.user, body);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.tasksService.findAll(req.user);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(req.user, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tasksService.delete(req.user, id);
  }
}
