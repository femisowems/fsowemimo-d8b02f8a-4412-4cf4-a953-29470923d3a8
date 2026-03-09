import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@secure-task-management/auth/roles.guard';
import { Roles } from '@secure-task-management/auth/roles.decorator';
import { UsersService } from './users.service';
import { UserRole } from '@secure-task-management/data/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActionType } from '@secure-task-management/data/enums';

@Controller('users')
@UseGuards(AuthGuard('supabase-jwt'))
export class UsersController {
  constructor(
    private usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Put(':id')
  @UseGuards(AuthGuard('supabase-jwt'))
  async updateUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const isSelf = req.user?.id === id;
    const role = req.user?.role;
    const isAdminOrOwner =
      role === UserRole.ADMIN || role === UserRole.OWNER;

    if (!isSelf && !isAdminOrOwner) {
      throw new ForbiddenException('Insufficient role to update this user');
    }

    return this.usersService.updateUser(id, updateData);
  }

  @Patch('preferences')
  async updatePreferences(@Req() req: any, @Body() preferences: any) {
    return this.usersService.updateUser(req.user.id, { preferences });
  }

  // ========== ADMIN-ONLY ENDPOINTS ==========

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async listUsers(@Req() req: any) {
    this.eventEmitter.emit('audit.log', {
      userId: req.user.id,
      action: ActionType.READ,
      resourceType: 'User',
      resourceId: 'list',
    });
    return this.usersService.listUsers(req.user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Req() req: any, @Body() userData: any) {
    const newUser = await this.usersService.createUser(req.user, userData);
    this.eventEmitter.emit('audit.log', {
      userId: req.user.id,
      action: ActionType.CREATE,
      resourceType: 'User',
      resourceId: newUser.id,
    });
    return newUser;
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserRole(
    @Req() req: any,
    @Param('id') userId: string,
    @Body() body: { role: UserRole },
  ) {
    const updated = await this.usersService.updateUserRole(
      req.user,
      userId,
      body.role,
    );
    this.eventEmitter.emit('audit.log', {
      userId: req.user.id,
      action: ActionType.UPDATE,
      resourceType: 'User',
      resourceId: userId,
    });
    return updated;
  }

  @Patch(':id/name')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserName(
    @Req() req: any,
    @Param('id') userId: string,
    @Body() body: { name: string },
  ) {
    const updated = await this.usersService.updateUserName(
      req.user,
      userId,
      body.name,
    );
    this.eventEmitter.emit('audit.log', {
      userId: req.user.id,
      action: ActionType.UPDATE,
      resourceType: 'User',
      resourceId: userId,
    });
    return updated;
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async setUserVerification(
    @Req() req: any,
    @Param('id') userId: string,
    @Body() body: { verified?: boolean },
  ) {
    const verified = body?.verified ?? true;
    const updated = await this.usersService.setUserVerification(
      req.user,
      userId,
      verified,
    );

    this.eventEmitter.emit('audit.log', {
      userId: req.user.id,
      action: ActionType.UPDATE,
      resourceType: 'UserVerification',
      resourceId: userId,
    });

    return updated;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Req() req: any, @Param('id') userId: string) {
    await this.usersService.deleteUser(req.user, userId);
    this.eventEmitter.emit('audit.log', {
      userId: req.user.id,
      action: ActionType.DELETE,
      resourceType: 'User',
      resourceId: userId,
    });
    return { success: true };
  }
}
