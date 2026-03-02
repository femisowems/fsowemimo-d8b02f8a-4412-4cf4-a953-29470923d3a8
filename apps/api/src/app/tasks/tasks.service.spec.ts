import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task, User, AuditLog } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { RbacService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/rbac.service';
import { OrgScopeService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/org-scope.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActionType, UserRole, TaskStatus } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
    let service: TasksService;
    let rbacService: jest.Mocked<RbacService>;
    let orgScopeService: jest.Mocked<OrgScopeService>;
    let eventEmitter: jest.Mocked<EventEmitter2>;

    const mockTaskRepo = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    const mockAuditLogRepo = {
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
                { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepo },
                {
                    provide: RbacService,
                    useValue: { canUpdateTask: jest.fn(), canDeleteTask: jest.fn() }
                },
                {
                    provide: OrgScopeService,
                    useValue: { getAccessibleOrganizationIds: jest.fn() }
                },
                {
                    provide: EventEmitter2,
                    useValue: { emit: jest.fn() }
                }
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        rbacService = module.get(RbacService);
        orgScopeService = module.get(OrgScopeService);
        eventEmitter = module.get(EventEmitter2);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date()
    } as unknown as User;

    const mockTask: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: 'IN_PROGRESS',
        category: 'WORK',
        organizationId: 'org-1',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
    } as Task;

    describe('create', () => {
        it('should create a task successfully', async () => {
            mockTaskRepo.create.mockReturnValue(mockTask);
            mockTaskRepo.save.mockResolvedValue(mockTask);

            const result = await service.create(mockUser, { title: 'Test Task' });

            expect(mockTaskRepo.create).toHaveBeenCalledWith({
                title: 'Test Task',
                organizationId: 'org-1',
                createdBy: 'user-1'
            });
            expect(mockTaskRepo.save).toHaveBeenCalled();
            expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log', { userId: 'user-1', action: ActionType.CREATE, resourceType: 'Task', resourceId: 'task-1' });
            expect(result).toEqual(mockTask);
        });

        it('should throw ForbiddenException if creating for another org', async () => {
            await expect(service.create(mockUser, { title: 'Test', organizationId: 'org-2' }))
                .rejects.toThrow(ForbiddenException);
            expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log', { userId: 'user-1', action: ActionType.CREATE, resourceType: 'Task', resourceId: 'BLOCKED: Wrong Org' });
        });
    });

    describe('findAll', () => {
        it('should return tasks for VIEWER strictly in their org', async () => {
            const viewerUser = { ...mockUser, role: UserRole.VIEWER } as User;
            mockTaskRepo.find.mockResolvedValue([mockTask]);

            const result = await service.findAll(viewerUser);

            expect(mockTaskRepo.find).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
            expect(result).toEqual([mockTask]);
        });

        it('should return tasks for accessible orgs for ADMIN/OWNER', async () => {
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-1', 'org-2']);
            mockTaskRepo.find.mockResolvedValue([mockTask]);

            const result = await service.findAll(mockUser);

            expect(mockTaskRepo.find).toHaveBeenCalledWith({
                where: { organizationId: expect.anything() }
            });
            expect(result).toEqual([mockTask]);
        });
        
        it('should return empty if accessible Orgs is empty for ADMIN/OWNER', async () => {
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue([]);

            const result = await service.findAll(mockUser);

            expect(mockTaskRepo.find).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('update', () => {
        it('should update task if allowed', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask);
            rbacService.canUpdateTask.mockResolvedValue(true);
            mockTaskRepo.save.mockResolvedValue({ ...mockTask, title: 'Updated' } as Task);

            const result = await service.update(mockUser, 'task-1', { title: 'Updated' });

            expect(result.title).toBe('Updated');
            expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log', { userId: 'user-1', action: ActionType.UPDATE, resourceType: 'Task', resourceId: 'task-1' });
        });

        it('should throw ForbiddenException if not allowed', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask);
            rbacService.canUpdateTask.mockResolvedValue(false);

            await expect(service.update(mockUser, 'task-1', { title: 'Updated' }))
                .rejects.toThrow(ForbiddenException);
            expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log', { userId: 'user-1', action: ActionType.UPDATE, resourceType: 'Task', resourceId: 'BLOCKED: Unauthorized task-1' });
        });
        
        it('should throw NotFoundException if task does not exist', async () => {
            mockTaskRepo.findOne.mockResolvedValue(null);

            await expect(service.update(mockUser, 'task-no', { title: 'Updated' }))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update task status from TODO to IN_PROGRESS (valid)', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask); // status: IN_PROGRESS
            const initialTask = { ...mockTask, status: 'todo' as unknown as TaskStatus };
            mockTaskRepo.findOne.mockResolvedValue(initialTask);
            rbacService.canUpdateTask.mockResolvedValue(true);
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-1']);
            mockTaskRepo.save.mockResolvedValue({ ...initialTask, status: 'in-progress' } as Task);

            const result = await service.updateStatus(mockUser, 'task-1', 'in-progress' as unknown as TaskStatus);

            expect(result.status).toBe('in-progress');
            expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log', expect.objectContaining({
                action: 'TASK_STATUS_CHANGED',
                resourceId: 'task-1',
                metadata: { fromStatus: 'todo', toStatus: 'in-progress' }
            }));
        });

        it('should throw BadRequestException on invalid transition', async () => {
            const initialTask = { ...mockTask, status: 'todo' as unknown as TaskStatus };
            mockTaskRepo.findOne.mockResolvedValue(initialTask);
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-1']);

            // todo -> completed is invalid
            await expect(service.updateStatus(mockUser, 'task-1', 'completed' as unknown as TaskStatus))
                .rejects.toThrow();
        });

        it('should throw ForbiddenException for VIEWER role', async () => {
            const initialTask = { ...mockTask, status: 'todo' as unknown as TaskStatus };
            mockTaskRepo.findOne.mockResolvedValue(initialTask);
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-1']);
            const viewerUser = { ...mockUser, role: UserRole.VIEWER } as User;

            await expect(service.updateStatus(viewerUser, 'task-1', 'in-progress' as unknown as TaskStatus))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if user cannot update task', async () => {
            const initialTask = { ...mockTask, status: 'todo' as unknown as TaskStatus };
            mockTaskRepo.findOne.mockResolvedValue(initialTask);
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-1']);
            rbacService.canUpdateTask.mockResolvedValue(false); // mock forbidden

            await expect(service.updateStatus(mockUser, 'task-1', 'in-progress' as unknown as TaskStatus))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException if cross-org', async () => {
            // Task org is 'org-1', user org is 'org-2' and accessible is 'org-2'
            const initialTask = { ...mockTask, status: 'todo' as unknown as TaskStatus };
            mockTaskRepo.findOne.mockResolvedValue(initialTask);
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-2']);
            const differentOrgUser = { ...mockUser, organizationId: 'org-2' };

            await expect(service.updateStatus(differentOrgUser, 'task-1', 'in-progress' as unknown as TaskStatus))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('delete', () => {
        it('should delete task if allowed', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask);
            rbacService.canDeleteTask.mockResolvedValue(true);

            await service.delete(mockUser, 'task-1');

            expect(mockTaskRepo.remove).toHaveBeenCalledWith(mockTask);
            expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log', { userId: 'user-1', action: ActionType.DELETE, resourceType: 'Task', resourceId: 'task-1' });
        });

        it('should throw ForbiddenException if not allowed to delete', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask);
            rbacService.canDeleteTask.mockResolvedValue(false);

            await expect(service.delete(mockUser, 'task-1'))
                .rejects.toThrow(ForbiddenException);
        });
    });

    describe('getTaskAuditLogs', () => {
        it('should return audit logs if user is allowed', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask);
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-1']);
            mockAuditLogRepo.find.mockResolvedValue([{ id: 'log-1' }]);

            const result = await service.getTaskAuditLogs(mockUser, 'task-1');

            expect(mockAuditLogRepo.find).toHaveBeenCalledWith({
                where: { resourceId: 'task-1', resourceType: 'Task' },
                order: { timestamp: 'DESC' }
            });
            expect(result).toEqual([{ id: 'log-1' }]);
        });

        it('should throw ForbiddenException if user is in different org without access', async () => {
            mockTaskRepo.findOne.mockResolvedValue(mockTask); // org-1
            orgScopeService.getAccessibleOrganizationIds.mockResolvedValue(['org-2']); // can only access org-2

            await expect(service.getTaskAuditLogs(mockUser, 'task-1'))
                .rejects.toThrow(ForbiddenException);
        });
    });
});
