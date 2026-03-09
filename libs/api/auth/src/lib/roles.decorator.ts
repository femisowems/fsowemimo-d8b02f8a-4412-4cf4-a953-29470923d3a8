import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@secure-task-management/data/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
