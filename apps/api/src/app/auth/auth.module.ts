import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseJwtStrategy } from './supabase-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Organization,
} from '@secure-task-management/data/entities';
import { AuthController } from './auth.controller';
import { RbacService } from '@secure-task-management/auth/rbac.service';
import { OrgScopeService } from '@secure-task-management/auth/org-scope.service';

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
export class AuthModule {}
