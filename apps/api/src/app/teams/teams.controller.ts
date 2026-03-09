import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '@secure-task-management/auth/roles.guard';
import { Roles } from '@secure-task-management/auth/roles.decorator';
import { UserRole } from '@secure-task-management/data/enums';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  create(@Request() req: any, @Body() body: { name: string; description?: string }) {
    return this.teamsService.create(req.user, body);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.teamsService.findAll(req.user);
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  addMember(@Request() req: any, @Param('id') id: string, @Body() body: { userId: string }) {
    return this.teamsService.addMember(req.user, id, body.userId);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  removeMember(@Request() req: any, @Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(req.user, id, userId);
  }
}
