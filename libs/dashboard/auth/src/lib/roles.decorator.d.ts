import { UserRole } from '@secure-task-management/dashboard-data/enums';
export declare const Roles: (
  ...roles: UserRole[]
) => import('@nestjs/common').CustomDecorator<string>;
