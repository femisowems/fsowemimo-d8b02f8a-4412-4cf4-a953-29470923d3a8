export enum UserRole {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    VIEWER = 'Viewer',
}

export interface SettingsPreferences {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'kanban' | 'list';
    itemsPerPage: number;
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
    name?: string;
    mfaEnabled?: boolean;
    sessionTimeout?: number;
    preferences?: SettingsPreferences;
}

export enum TaskStatus {
    TODO = 'todo',
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in-progress',
    BLOCKED = 'blocked',
    COMPLETED = 'completed',
    ARCHIVED = 'archived',
}

export enum TaskCategory {
    WORK = 'work',
    PERSONAL = 'personal',
    SHOPPING = 'shopping',
    OTHER = 'other',
}

export enum TaskPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export interface Task {
    id: string;
    title: string;
    description: string;
    category: TaskCategory;
    status: TaskStatus;
    priority: TaskPriority;
    organizationId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}
