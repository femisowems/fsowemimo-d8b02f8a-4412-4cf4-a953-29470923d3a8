
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/dashboard-data/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
