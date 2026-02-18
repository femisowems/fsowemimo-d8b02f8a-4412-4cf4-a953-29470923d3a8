/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable, Inject } from '@nestjs/common';
import { User, Task } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/enums';
import { OrgScopeService } from './org-scope.service';

@Injectable()
export class RbacService {
    constructor(@Inject(OrgScopeService) private readonly orgScopeService: OrgScopeService) { }

    hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
        if (requiredRoles.includes(userRole)) return true;

        if (userRole === UserRole.OWNER) {
            if (requiredRoles.includes(UserRole.ADMIN) || requiredRoles.includes(UserRole.VIEWER)) return true;
        }

        if (userRole === UserRole.ADMIN) {
            if (requiredRoles.includes(UserRole.VIEWER)) return true;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    canCreateTask(_user: User): boolean {
        // All roles allowed to create task in their own org
        // "organizationId must equal user.organizationId" is a data constraint check rather than permission boolean here
        // But boolean check is: Yes, they can create.
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async canReadTasks(_user: User): Promise<boolean> {
        // Logic handled in service query filtering usually, but as a check:
        return true;
    }

    // Actually, for Read/Update/Delete on specific task:

    async canUpdateTask(user: User, task: Task): Promise<boolean> {
        // Viewer -> only if createdBy === user.id
        if (user.role === UserRole.VIEWER) {
            return task.createdBy === user.id;
        }

        // Owner/Admin -> allowed if task org IN accessibleOrgIds
        const accessibleOrgs = await this.orgScopeService.getAccessibleOrganizationIds(user);
        return accessibleOrgs.includes(task.organizationId);
    }

    async canDeleteTask(user: User, task: Task): Promise<boolean> {
        // Viewer -> forbidden
        if (user.role === UserRole.VIEWER) {
            return false;
        }

        // Owner/Admin -> allowed if task org IN accessibleOrgIds
        const accessibleOrgs = await this.orgScopeService.getAccessibleOrganizationIds(user);
        return accessibleOrgs.includes(task.organizationId);
    }
}
