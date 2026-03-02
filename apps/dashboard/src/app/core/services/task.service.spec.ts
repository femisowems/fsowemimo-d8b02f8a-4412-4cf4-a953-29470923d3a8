import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '../models';

describe('TaskService', () => {
    let service: TaskService;
    let httpMock: HttpTestingController;

    const mockTasks: Task[] = [
        {
            id: '1',
            title: 'Test Task 1',
            description: 'Description 1',
            status: TaskStatus.TODO,
            category: TaskCategory.WORK,
            priority: TaskPriority.MEDIUM,
            organizationId: 'org1',
            createdBy: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Test Task 2',
            description: 'Description 2',
            status: TaskStatus.COMPLETED,
            category: TaskCategory.PERSONAL,
            priority: TaskPriority.LOW,
            organizationId: 'org1',
            createdBy: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TaskService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(TaskService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        if (httpMock) {
            httpMock.verify();
        }
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch tasks and normalize them', async () => {
        const rawTasks = [
            { ...mockTasks[0], status: 'TODO', category: 'WORK' },
            { ...mockTasks[1], status: 'COMPLETED', category: 'PERSONAL' }
        ];

        const fetchPromise = service.fetchTasks();

        const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        expect(req.request.method).toBe('GET');
        req.flush(rawTasks);

        await fetchPromise;

        expect(service.tasks()).toHaveLength(2);
        expect(service.tasks()[0].status).toBe(TaskStatus.TODO);
        expect(service.tasks()[0].category).toBe(TaskCategory.WORK);
    });

    it('should calculate task stats correctly', async () => {
        const fetchPromise = service.fetchTasks();
        const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        req.flush(mockTasks);
        await fetchPromise;

        const stats = service.taskStats();
        expect(stats.todo).toBe(1);
        expect(stats.completed).toBe(1);
        expect(stats.inProgress).toBe(0);
        expect(stats.total).toBe(2);
    });

    it('should handle fetch error', async () => {
        const fetchPromise = service.fetchTasks();
        const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        req.error(new ErrorEvent('Network error'));

        await fetchPromise;

        expect(service.error()).toBe('Failed to load tasks');
        expect(service.isLoading()).toBe(false);
    });

    it('should create task and refresh', async () => {
        const newTask = { title: 'New' };
        const createPromise = service.createTask(newTask);

        const postReq = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        expect(postReq.request.method).toBe('POST');
        postReq.flush({});

        // Wait for microtask so createTask continues to fetchTasks()
        await Promise.resolve();

        // Capture the following GET request from refresh
        const getReq = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        getReq.flush(mockTasks);

        await createPromise;
    });

    it('should update task and refresh', async () => {
        const updatePromise = service.updateTask('1', { status: TaskStatus.IN_PROGRESS });

        const putReq = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
        expect(putReq.request.method).toBe('PUT');
        putReq.flush({});

        // Wait for microtask
        await Promise.resolve();

        // Capture the refresh call
        const getReq = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        getReq.flush(mockTasks);

        await updatePromise;
    });

    it('should delete task and refresh', async () => {
        const deletePromise = service.deleteTask('1');

        const deleteReq = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush({});

        // Wait for microtask
        await Promise.resolve();

        // Capture the refresh call
        const getReq = httpMock.expectOne(`${environment.apiUrl}/tasks`);
        getReq.flush(mockTasks);

        await deletePromise;
    });
});
