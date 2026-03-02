
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Organization } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { UserRole } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/enums';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Organization)
        private orgRepository: Repository<Organization>
    ) { }

    async validateSupabaseUser(payload: Record<string, unknown>): Promise<User> {
        const { sub: supabaseUserId, email, user_metadata } = payload as { sub: string, email: string, user_metadata?: { role?: UserRole } };
        const role = user_metadata?.role || UserRole.VIEWER;

        let user = await this.usersRepository.findOne({ where: { supabaseUserId } });

        if (!user) {
            // Check if a user with same email exists (potential link)
            user = await this.usersRepository.findOne({ where: { email } });
            if (user) {
                // Link existing user to supabase
                user.supabaseUserId = supabaseUserId;
                // Optional: Update role if we want to trust the metadata on link, 
                // but usually we keep existing role. Let's keep existing role for security on link.
                await this.usersRepository.save(user);
            } else {
                // Create new user
                let defaultOrg = await this.orgRepository.findOne({ where: { name: 'Default Organization' } });
                if (!defaultOrg) {
                    defaultOrg = this.orgRepository.create({
                        name: 'Default Organization'
                    });
                    await this.orgRepository.save(defaultOrg);
                }

                user = this.usersRepository.create({
                    supabaseUserId,
                    email,
                    role: role as UserRole, // Use the role from metadata
                    organizationId: defaultOrg.id
                });
                await this.usersRepository.save(user);
            }
        }

        return user;
    }

    async getMe(userId: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id: userId } });
    }
}
