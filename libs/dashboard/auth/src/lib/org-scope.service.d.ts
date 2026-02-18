import { Repository } from 'typeorm';
import { User, Organization } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/entities';
export declare class OrgScopeService {
    private readonly orgRepo;
    constructor(orgRepo: Repository<Organization>);
    getAccessibleOrganizationIds(user: User): Promise<string[]>;
}
