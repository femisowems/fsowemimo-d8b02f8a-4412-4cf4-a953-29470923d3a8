
import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, User } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { RbacService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/rbac.service';
import { OrgScopeService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/org-scope.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActionType, UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepo: Repository<Task>,
        @Inject(RbacService)
        private rbacService: RbacService,
        @Inject(OrgScopeService)
        @Inject(OrgScopeService)
        private orgScopeService: OrgScopeService,
        private eventEmitter: EventEmitter2
    ) { }

    async create(user: User, taskData: Partial<Task>): Promise<Task> {
        // CreateTask: All roles allowed, orgId must match user's org
        if (taskData.organizationId && taskData.organizationId !== user.organizationId) {
            this.eventEmitter.emit('audit.log', { userId: user.id, action: ActionType.CREATE, resourceType: 'Task', resourceId: 'BLOCKED: Wrong Org' });
            throw new ForbiddenException('Cannot create task in another organization');
        }

        const newTask = this.tasksRepo.create({
            ...taskData,
            organizationId: user.organizationId,
            createdBy: user.id
        });

        // Explicitly define organization relationship if needed by TypeORM cascade, 
        // but setting ID column usually enough.

        const saved = await this.tasksRepo.save(newTask);
        this.eventEmitter.emit('audit.log', { userId: user.id, action: ActionType.CREATE, resourceType: 'Task', resourceId: saved.id });
        return saved;
    }

    async findAll(user: User): Promise<Task[]> {
        // ReadTasks
        // Owner/Admin -> tasks where organizationId IN accessibleOrgIds
        // Viewer -> tasks where createdBy = user.id (AND implicitly in their org)

        if (user.role === UserRole.VIEWER) {
            return this.tasksRepo.find({
                where: {
                    organizationId: user.organizationId
                }
            });
        }

        // Owner/Admin
        const accessibleOrgs = await this.orgScopeService.getAccessibleOrganizationIds(user);
        if (accessibleOrgs.length === 0) return [];

        return this.tasksRepo.find({
            where: {
                organizationId: In(accessibleOrgs)
            }
        });
    }

    async update(user: User, id: string, updateData: Partial<Task>): Promise<Task> {
        const task = await this.tasksRepo.findOne({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        const allowed = await this.rbacService.canUpdateTask(user, task);
        if (!allowed) {
            this.eventEmitter.emit('audit.log', { userId: user.id, action: ActionType.UPDATE, resourceType: 'Task', resourceId: `BLOCKED: Unauthorized ${id}` });
            throw new ForbiddenException('Cannot update this task');
        }

        Object.assign(task, updateData);
        const updated = await this.tasksRepo.save(task);
        this.eventEmitter.emit('audit.log', { userId: user.id, action: ActionType.UPDATE, resourceType: 'Task', resourceId: id });
        return updated;
    }

    async delete(user: User, id: string): Promise<void> {
        const task = await this.tasksRepo.findOne({ where: { id } });
        if (!task) throw new NotFoundException('Task not found');

        const allowed = await this.rbacService.canDeleteTask(user, task);
        if (!allowed) {
            this.eventEmitter.emit('audit.log', { userId: user.id, action: ActionType.DELETE, resourceType: 'Task', resourceId: `BLOCKED: Unauthorized ${id}` });
            throw new ForbiddenException('Cannot delete this task');
        }

        await this.tasksRepo.remove(task);
        this.eventEmitter.emit('audit.log', { userId: user.id, action: ActionType.DELETE, resourceType: 'Task', resourceId: id });
    }
}
