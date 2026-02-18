
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Organization } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/entities';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/enums';

@Injectable()
export class OrgScopeService {
    constructor(
        @InjectRepository(Organization)
        private readonly orgRepo: Repository<Organization>
    ) { }

    async getAccessibleOrganizationIds(user: User): Promise<string[]> {
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

        if (!userOrg) return []; // Should not happen for valid user

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
}
