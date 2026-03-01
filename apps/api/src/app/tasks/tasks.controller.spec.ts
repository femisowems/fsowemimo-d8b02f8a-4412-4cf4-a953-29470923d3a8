import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Reflector } from '@nestjs/core';
import { RbacService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/rbac.service';

describe('TasksController', () => {
    let controller: TasksController;
    let service: jest.Mocked<TasksService>;

    const mockTasksService = {
        create: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        updateStatus: jest.fn(),
        delete: jest.fn(),
        getTaskAuditLogs: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                { provide: TasksService, useValue: mockTasksService },
                {
                    provide: RbacService, 
                    useValue: { canUpdateTask: jest.fn(), canDeleteTask: jest.fn() }
                },
                {
                    provide: Reflector, 
                    useValue: { get: jest.fn(), getAllAndOverride: jest.fn() }
                }
            ],
        }).compile();

        controller = module.get<TasksController>(TasksController);
        service = module.get(TasksService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockReq = { user: { id: 'user-1' } };

    describe('create', () => {
        it('should call tasksService.create', async () => {
            const dto = { title: 'New Task' };
            await controller.create(mockReq, dto);
            expect(service.create).toHaveBeenCalledWith(mockReq.user, dto);
        });
    });

    describe('findAll', () => {
        it('should call tasksService.findAll', async () => {
            await controller.findAll(mockReq);
            expect(service.findAll).toHaveBeenCalledWith(mockReq.user);
        });
    });

    describe('update', () => {
        it('should call tasksService.update', async () => {
            const dto = { title: 'Updated Task' };
            await controller.update(mockReq, 'task-1', dto);
            expect(service.update).toHaveBeenCalledWith(mockReq.user, 'task-1', dto);
        });
    });

    describe('updateStatus', () => {
        it('should call tasksService.updateStatus', async () => {
            const dto = { status: 'in-progress' as any };
            await controller.updateStatus(mockReq, 'task-1', dto);
            expect(service.updateStatus).toHaveBeenCalledWith(mockReq.user, 'task-1', dto.status);
        });
    });

    describe('getAuditLogs', () => {
        it('should call tasksService.getTaskAuditLogs', async () => {
            await controller.getAuditLogs(mockReq, 'task-1');
            expect(service.getTaskAuditLogs).toHaveBeenCalledWith(mockReq.user, 'task-1');
        });
    });

    describe('remove', () => {
        it('should call tasksService.delete', async () => {
            await controller.remove(mockReq, 'task-1');
            expect(service.delete).toHaveBeenCalledWith(mockReq.user, 'task-1');
        });
    });
});
