import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Task,
  User,
  Team,
} from '@secure-task-management/data/entities';
import { RbacService } from '@secure-task-management/auth/rbac.service';
import { OrgScopeService } from '@secure-task-management/auth/org-scope.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ActionType,
  UserRole,
} from '@secure-task-management/data/enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(Team)
    private teamsRepo: Repository<Team>,
    @Inject(RbacService)
    private rbacService: RbacService,
    @Inject(OrgScopeService)
    private orgScopeService: OrgScopeService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(user: User, taskData: Partial<Task>): Promise<Task> {
    // CreateTask: All roles allowed, orgId must match user's org
    if (
      taskData.organizationId &&
      taskData.organizationId !== user.organizationId
    ) {
      this.eventEmitter.emit('audit.log', {
        userId: user.id,
        action: ActionType.CREATE,
        resourceType: 'Task',
        resourceId: 'BLOCKED: Wrong Org',
      });
      throw new ForbiddenException(
        'Cannot create task in another organization',
      );
    }

    if (taskData.assignedTeamId) {
      const team = await this.teamsRepo.findOne({
        where: { id: taskData.assignedTeamId, organizationId: user.organizationId },
      });
      if (!team) throw new BadRequestException('Assigned team not found in your organization');
    }

    const newTask = this.tasksRepo.create({
      ...taskData,
      organizationId: user.organizationId,
      createdBy: user.id,
    });

    // Explicitly define organization relationship if needed by TypeORM cascade,
    // but setting ID column usually enough.

    const saved = await this.tasksRepo.save(newTask);
    this.eventEmitter.emit('audit.log', {
      userId: user.id,
      action: ActionType.CREATE,
      resourceType: 'Task',
      resourceId: saved.id,
    });
    return saved;
  }

  async findAll(user: User): Promise<Task[]> {
    // ReadTasks
    // Owner/Admin -> tasks where organizationId IN accessibleOrgIds
    // Viewer -> tasks where createdBy = user.id (AND implicitly in their org)

    if (user.role === UserRole.VIEWER) {
      return this.tasksRepo.find({
        where: {
          organizationId: user.organizationId,
          createdBy: user.id,
        },
      });
    }

    // Owner/Admin
    const accessibleOrgs =
      await this.orgScopeService.getAccessibleOrganizationIds(user);
    if (accessibleOrgs.length === 0) return [];

    return this.tasksRepo.find({
      where: {
        organizationId: In(accessibleOrgs),
      },
    });
  }

  async update(
    user: User,
    id: string,
    updateData: Partial<Task>,
  ): Promise<Task> {
    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const allowed = await this.rbacService.canUpdateTask(user, task);
    if (!allowed) {
      this.eventEmitter.emit('audit.log', {
        userId: user.id,
        action: ActionType.UPDATE,
        resourceType: 'Task',
        resourceId: `BLOCKED: Unauthorized ${id}`,
      });
      throw new ForbiddenException('Cannot update this task');
    }

    if (updateData.assignedTeamId) {
      const team = await this.teamsRepo.findOne({
        where: { id: updateData.assignedTeamId, organizationId: user.organizationId },
      });
      if (!team) throw new BadRequestException('Assigned team not found in your organization');
    }

    Object.assign(task, updateData);
    const updated = await this.tasksRepo.save(task);
    this.eventEmitter.emit('audit.log', {
      userId: user.id,
      action: ActionType.UPDATE,
      resourceType: 'Task',
      resourceId: id,
    });
    return updated;
  }

  async delete(user: User, id: string): Promise<void> {
    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const allowed = await this.rbacService.canDeleteTask(user, task);
    if (!allowed) {
      this.eventEmitter.emit('audit.log', {
        userId: user.id,
        action: ActionType.DELETE,
        resourceType: 'Task',
        resourceId: `BLOCKED: Unauthorized ${id}`,
      });
      throw new ForbiddenException('Cannot delete this task');
    }

    await this.tasksRepo.remove(task);
    this.eventEmitter.emit('audit.log', {
      userId: user.id,
      action: ActionType.DELETE,
      resourceType: 'Task',
      resourceId: id,
    });
  }
}
