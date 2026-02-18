import { UserRole } from './enums';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
}

export interface Organization {
    id: string;
    name: string;
    parentOrganizationId?: string | null;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    organizationId: string;
    createdBy: string;
}
