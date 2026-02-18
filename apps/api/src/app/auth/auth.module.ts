
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseJwtStrategy } from './supabase-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Organization } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';
import { AuthController } from './auth.controller';
import { RbacService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/rbac.service';
import { OrgScopeService } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/auth/org-scope.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Organization]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'dev_secret',
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, SupabaseJwtStrategy, RbacService, OrgScopeService],
    controllers: [AuthController],
    exports: [AuthService, RbacService, OrgScopeService],
})
export class AuthModule { }
