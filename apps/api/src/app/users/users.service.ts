import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';
import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  private supabaseAdminClient = this.createSupabaseAdminClient();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private createSupabaseAdminClient() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      return null;
    }

    return createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  private ensureSupabaseAdminClient() {
    if (!this.supabaseAdminClient) {
      throw new InternalServerErrorException(
        'Supabase admin client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      );
    }

    return this.supabaseAdminClient;
  }

  private async upsertLocalUserFromSupabase(
    supabaseUser: SupabaseUser,
    fallbackOrganizationId: string,
  ) {
    const metadata = (supabaseUser.user_metadata || {}) as Record<string, any>;
    const orgId =
      (metadata.organization_id as string | undefined) ||
      fallbackOrganizationId;
    const role =
      ((metadata.role as UserRole | undefined) ?? UserRole.VIEWER) as UserRole;
    const isVerified = Boolean(supabaseUser.email_confirmed_at);

    let localUser = await this.usersRepository.findOne({
      where: [{ supabaseUserId: supabaseUser.id }, { email: supabaseUser.email }],
    });

    if (!localUser) {
      localUser = this.usersRepository.create({
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email || '',
        role,
        organizationId: orgId,
        name:
          (metadata.name as string | undefined) ||
          (metadata.full_name as string | undefined) ||
          null,
        emailVerified: isVerified,
        verifiedAt: supabaseUser.email_confirmed_at
          ? new Date(supabaseUser.email_confirmed_at)
          : null,
      });
      await this.usersRepository.save(localUser);
      return;
    }

    localUser.supabaseUserId = supabaseUser.id;
    localUser.email = supabaseUser.email || localUser.email;
    localUser.organizationId = localUser.organizationId || orgId;
    localUser.emailVerified = isVerified;
    localUser.verifiedAt = supabaseUser.email_confirmed_at
      ? new Date(supabaseUser.email_confirmed_at)
      : null;

    await this.usersRepository.save(localUser);
  }

  private async syncOrganizationUsersFromSupabase(organizationId: string) {
    const supabase = this.ensureSupabaseAdminClient();

    // Pull a broad page and sync org users into local DB so unverified signups appear.
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list Supabase users: ${error.message}`,
      );
    }

    const orgUsers = (data?.users || []).filter((u) => {
      const metadata = (u.user_metadata || {}) as Record<string, any>;
      return metadata.organization_id === organizationId;
    });

    for (const supabaseUser of orgUsers) {
      await this.upsertLocalUserFromSupabase(supabaseUser, organizationId);
    }
  }

  private async resolveSupabaseUser(localUser: User) {
    const supabase = this.ensureSupabaseAdminClient();

    if (localUser.supabaseUserId) {
      const { data, error } = await supabase.auth.admin.getUserById(
        localUser.supabaseUserId,
      );

      if (!error && data?.user) {
        return data.user;
      }
    }

    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to query Supabase users: ${error.message}`,
      );
    }

    return (data?.users || []).find(
      (supabaseUser) =>
        supabaseUser.email?.toLowerCase() === localUser.email.toLowerCase(),
    );
  }

  async updateUser(id: string, updateData: Partial<User>) {
    await this.usersRepository.update(id, updateData);
    return this.usersRepository.findOne({ where: { id } });
  }

  // Admin-only: List all users in the admin's organization
  async listUsers(adminUser: User): Promise<User[]> {
    await this.syncOrganizationUsersFromSupabase(adminUser.organizationId);

    return this.usersRepository.find({
      where: { organizationId: adminUser.organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin-only: Create/invite a new user
  async createUser(adminUser: User, userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new BadRequestException('Email is required');
    }

    const supabase = this.ensureSupabaseAdminClient();

    // Invite user via email - this automatically sends a confirmation email
    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(userData.email, {
        data: {
          name: userData.name || undefined,
          role: userData.role || UserRole.VIEWER,
          organization_id: adminUser.organizationId,
        },
      });

    if (inviteError || !inviteData?.user) {
      throw new InternalServerErrorException(
        `Failed to invite user in Supabase: ${inviteError?.message || 'Unknown error'}`,
      );
    }

    // Now save to local DB with Supabase user ID
    const newUser = this.usersRepository.create({
      ...userData,
      supabaseUserId: inviteData.user.id,
      organizationId: adminUser.organizationId,
      role: userData.role || UserRole.VIEWER,
      emailVerified: false,
      verifiedAt: null,
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

  // Admin-only: Update user name
  async updateUserName(
    adminUser: User,
    userId: string,
    newName: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ensure user is in admin's org
    if (user.organizationId !== adminUser.organizationId) {
      throw new ForbiddenException('Cannot modify user from another organization');
    }

    if (!newName || newName.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    const trimmedName = newName.trim();

    // Update in local database
    user.name = trimmedName;
    const updatedUser = await this.usersRepository.save(user);

    // Also update in Supabase if user has a Supabase account
    if (user.supabaseUserId) {
      const supabase = this.ensureSupabaseAdminClient();
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.supabaseUserId,
        {
          user_metadata: {
            name: trimmedName,
          },
        },
      );

      if (updateError) {
        console.warn(
          `Failed to update name in Supabase for user ${user.supabaseUserId}: ${updateError.message}`,
        );
        // Don't throw - the local update succeeded, Supabase sync is secondary
      }
    }

    return updatedUser;
  }

  // Admin-only: Mark a user as verified/unverified
  async setUserVerification(
    adminUser: User,
    userId: string,
    verified: boolean,
  ): Promise<User> {
    if (!verified) {
      throw new BadRequestException(
        'Manual unverification is not supported in Supabase admin flow',
      );
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.organizationId !== adminUser.organizationId) {
      throw new ForbiddenException(
        'Cannot modify user from another organization',
      );
    }

    const supabaseUser = await this.resolveSupabaseUser(user);

    if (!supabaseUser) {
      throw new NotFoundException(
        'No Supabase auth user found for this account. Ask the user to sign up first.',
      );
    }

    const supabase = this.ensureSupabaseAdminClient();
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      supabaseUser.id,
      { email_confirm: true },
    );

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to verify user in Supabase: ${updateError.message}`,
      );
    }

    user.emailVerified = verified;
    user.verifiedAt = new Date();
    user.supabaseUserId = user.supabaseUserId || supabaseUser.id;
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

    // Delete from Supabase if user has a Supabase account
    if (user.supabaseUserId) {
      const supabase = this.ensureSupabaseAdminClient();
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.supabaseUserId,
      );

      if (deleteError) {
        throw new InternalServerErrorException(
          `Failed to delete user from Supabase: ${deleteError.message}`,
        );
      }
    }

    // Delete from local database
    await this.usersRepository.remove(user);
  }
}
