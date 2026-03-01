export enum UserRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  VIEWER = 'Viewer',
}

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
}

export enum TaskStatus {
  TODO = 'todo',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}
