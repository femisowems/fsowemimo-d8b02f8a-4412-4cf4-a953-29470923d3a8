import { User, Task } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/entities';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/enums';
import { OrgScopeService } from './org-scope.service';
export declare class RbacService {
    private readonly orgScopeService;
    constructor(orgScopeService: OrgScopeService);
    hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean;
    canCreateTask(_user: User): boolean;
    canReadTasks(_user: User): Promise<boolean>;
    canUpdateTask(user: User, task: Task): Promise<boolean>;
    canDeleteTask(user: User, task: Task): Promise<boolean>;
}
