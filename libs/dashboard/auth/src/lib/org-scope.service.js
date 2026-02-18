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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from "../../../data/src/lib/entities";
import { UserRole } from "../../../data/src/lib/enums";
let OrgScopeService = class OrgScopeService {
    orgRepo;
    constructor(orgRepo) {
        this.orgRepo = orgRepo;
    }
    async getAccessibleOrganizationIds(user) {
        const userOrgId = user.organizationId;
        // Viewer -> same org id
        // Although requirement says "ownership rules apply", for purely "accessible scope" 
        // it is usually just their org because they can't see other orgs.
        if (user.role === UserRole.VIEWER) {
            return [userOrgId];
        }
        // Owner/Admin of a PARENT org -> return parent org id + child org ids
        // We check if this org is a parent (has children). 
        // Or simpler: fetch all orgs where parentOrganizationId is this user's org.
        // AND include the org itself.
        // Check if user is in a child org? 
        // Req: "User in child org -> return only child org id"
        // How do we know if it is a child org? It has a parentId.
        // Implementation:
        // 1. Fetch user's org to see if it has a direct parent.
        // 2. Fetch children of user's org.
        const userOrg = await this.orgRepo.findOne({
            where: { id: userOrgId },
            relations: ['childOrganizations', 'parentOrganization']
        });
        if (!userOrg)
            return []; // Should not happen for valid user
        // Case: User is in a "Child Org" (has parent)
        // Req: "return only child org id" (meaning just their own id)
        // Irrespective of role? "User in child org" implies any role? 
        // Let's assume yes, if you are in a sub-org, you don't see parent or siblings usually.
        // If you are owner of sub-org, you see sub-org (and its children? Requirements silent on depth > 2, assuming 2 levels).
        if (userOrg.parentOrganization) {
            // It is a child org.
            return [userOrg.id];
        }
        // Case: User is in a "Parent Org" (no parent, potentially has children)
        // Owner/Admin -> Get all children
        const childIds = userOrg.childOrganizations.map(child => child.id);
        return [userOrg.id, ...childIds];
    }
};
OrgScopeService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Organization)),
    __metadata("design:paramtypes", [Repository])
], OrgScopeService);
export { OrgScopeService };
//# sourceMappingURL=org-scope.service.js.map