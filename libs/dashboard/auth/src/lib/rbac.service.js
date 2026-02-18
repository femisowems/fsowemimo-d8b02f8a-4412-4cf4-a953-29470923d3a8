var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Inject } from '@nestjs/common';
import { UserRole } from "../../../data/src/lib/enums";
import { OrgScopeService } from './org-scope.service';
let RbacService = class RbacService {
    orgScopeService;
    constructor(orgScopeService) {
        this.orgScopeService = orgScopeService;
    }
    hasRequiredRole(userRole, requiredRoles) {
        if (requiredRoles.includes(userRole))
            return true;
        if (userRole === UserRole.OWNER) {
            if (requiredRoles.includes(UserRole.ADMIN) || requiredRoles.includes(UserRole.VIEWER))
                return true;
        }
        if (userRole === UserRole.ADMIN) {
            if (requiredRoles.includes(UserRole.VIEWER))
                return true;
        }
        return false;
    }
    canCreateTask(_user) {
        // All roles allowed to create task in their own org
        // "organizationId must equal user.organizationId" is a data constraint check rather than permission boolean here
        // But boolean check is: Yes, they can create.
        return true;
    }
    async canReadTasks(_user) {
        // Logic handled in service query filtering usually, but as a check:
        return true;
    }
    // Actually, for Read/Update/Delete on specific task:
    async canUpdateTask(user, task) {
        // Viewer -> only if createdBy === user.id
        if (user.role === UserRole.VIEWER) {
            return task.createdBy === user.id;
        }
        // Owner/Admin -> allowed if task org IN accessibleOrgIds
        const accessibleOrgs = await this.orgScopeService.getAccessibleOrganizationIds(user);
        return accessibleOrgs.includes(task.organizationId);
    }
    async canDeleteTask(user, task) {
        // Viewer -> forbidden
        if (user.role === UserRole.VIEWER) {
            return false;
        }
        // Owner/Admin -> allowed if task org IN accessibleOrgIds
        const accessibleOrgs = await this.orgScopeService.getAccessibleOrganizationIds(user);
        return accessibleOrgs.includes(task.organizationId);
    }
};
RbacService = __decorate([
    Injectable(),
    __param(0, Inject(OrgScopeService)),
    __metadata("design:paramtypes", [OrgScopeService])
], RbacService);
export { RbacService };
//# sourceMappingURL=rbac.service.js.map