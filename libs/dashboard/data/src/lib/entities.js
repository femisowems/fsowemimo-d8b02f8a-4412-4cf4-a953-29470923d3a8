var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, ActionType } from './enums';
// --------------------------------------------------
// ORGANIZATION ENTITY
// --------------------------------------------------
let Organization = class Organization {
    id;
    name;
    parentOrganizationId;
    parentOrganization;
    childOrganizations;
    users;
    tasks;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Organization.prototype, "id", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "parentOrganizationId", void 0);
__decorate([
    ManyToOne(() => Organization, (org) => org.childOrganizations, { nullable: true }),
    JoinColumn({ name: 'parentOrganizationId' }),
    __metadata("design:type", Organization)
], Organization.prototype, "parentOrganization", void 0);
__decorate([
    OneToMany(() => Organization, (org) => org.parentOrganization),
    __metadata("design:type", Array)
], Organization.prototype, "childOrganizations", void 0);
__decorate([
    OneToMany(() => User, (user) => user.organization),
    __metadata("design:type", Array)
], Organization.prototype, "users", void 0);
__decorate([
    OneToMany(() => Task, (task) => task.organization),
    __metadata("design:type", Array)
], Organization.prototype, "tasks", void 0);
Organization = __decorate([
    Entity('organizations')
], Organization);
export { Organization };
// --------------------------------------------------
// USER ENTITY
// --------------------------------------------------
let User = class User {
    id;
    supabaseUserId;
    email;
    passwordHash;
    role;
    organizationId;
    organization;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({ type: 'text', unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "supabaseUserId", void 0);
__decorate([
    Column({ type: 'text', unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.VIEWER
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "organizationId", void 0);
__decorate([
    ManyToOne(() => Organization, (org) => org.users),
    JoinColumn({ name: 'organizationId' }),
    __metadata("design:type", Organization)
], User.prototype, "organization", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
User = __decorate([
    Entity('users')
], User);
export { User };
// --------------------------------------------------
// TASK ENTITY
// --------------------------------------------------
let Task = class Task {
    id;
    title;
    description;
    category;
    status;
    organizationId;
    organization;
    createdBy;
    creator;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Task.prototype, "id", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "category", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "organizationId", void 0);
__decorate([
    ManyToOne(() => Organization, (org) => org.tasks),
    JoinColumn({ name: 'organizationId' }),
    __metadata("design:type", Organization)
], Task.prototype, "organization", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Task.prototype, "createdBy", void 0);
__decorate([
    ManyToOne(() => User),
    JoinColumn({ name: 'createdBy' }),
    __metadata("design:type", User)
], Task.prototype, "creator", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
Task = __decorate([
    Entity('tasks')
], Task);
export { Task };
// --------------------------------------------------
// AUDIT LOG ENTITY
// --------------------------------------------------
let AuditLog = class AuditLog {
    id;
    userId;
    action;
    resourceType;
    resourceId;
    timestamp;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    Column({
        type: 'simple-enum',
        enum: ActionType
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceType", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceId", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
AuditLog = __decorate([
    Entity('audit_logs')
], AuditLog);
export { AuditLog };
//# sourceMappingURL=entities.js.map