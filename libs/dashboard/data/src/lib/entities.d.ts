import { UserRole, ActionType } from './enums';
export declare class Organization {
    id: string;
    name: string;
    parentOrganizationId: string;
    parentOrganization: Organization;
    childOrganizations: Organization[];
    users: User[];
    tasks: Task[];
}
export declare class User {
    id: string;
    supabaseUserId: string | null;
    email: string;
    passwordHash: string | null;
    role: UserRole;
    organizationId: string;
    organization: Organization;
    createdAt: Date;
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    organizationId: string;
    organization: Organization;
    createdBy: string;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AuditLog {
    id: string;
    userId: string;
    action: ActionType;
    resourceType: string;
    resourceId: string;
    timestamp: Date;
}
