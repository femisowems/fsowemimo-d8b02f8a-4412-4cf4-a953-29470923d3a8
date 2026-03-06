import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async updateUser(id: string, updateData: Partial<User>) {
    await this.usersRepository.update(id, updateData);
    return this.usersRepository.findOne({ where: { id } });
  }

  // Admin-only: List all users in the admin's organization
  async listUsers(adminUser: User): Promise<User[]> {
    return this.usersRepository.find({
      where: { organizationId: adminUser.organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin-only: Create/invite a new user
  async createUser(adminUser: User, userData: Partial<User>): Promise<User> {
    // Ensure the new user is in the admin's org
    const newUser = this.usersRepository.create({
      ...userData,
      organizationId: adminUser.organizationId,
      role: userData.role || UserRole.VIEWER,
    });
    return this.usersRepository.save(newUser);
  }

  // Admin-only: Update user role
  async updateUserRole(
    adminUser: User,
    userId: string,
    newRole: UserRole,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ensure user is in admin's org
    if (user.organizationId !== adminUser.organizationId) {
      throw new ForbiddenException('Cannot modify user from another organization');
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }

  // Admin-only: Delete a user
  async deleteUser(adminUser: User, userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ensure user is in admin's org
    if (user.organizationId !== adminUser.organizationId) {
      throw new ForbiddenException('Cannot delete user from another organization');
    }

    // Prevent deleting self
    if (user.id === adminUser.id) {
      throw new ForbiddenException('Cannot delete yourself');
    }

    await this.usersRepository.remove(user);
  }
}
