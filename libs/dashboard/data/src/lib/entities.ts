
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, ActionType } from './enums';

// --------------------------------------------------
// ORGANIZATION ENTITY
// --------------------------------------------------
@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    name!: string;

    @Column({ type: 'text', nullable: true })
    parentOrganizationId!: string;

    @ManyToOne(() => Organization, (org) => org.childOrganizations, { nullable: true })
    @JoinColumn({ name: 'parentOrganizationId' })
    parentOrganization!: Organization;

    @OneToMany(() => Organization, (org) => org.parentOrganization)
    childOrganizations!: Organization[];

    @OneToMany(() => User, (user) => user.organization)
    users!: User[];

    @OneToMany(() => Task, (task) => task.organization)
    tasks!: Task[];
}

// --------------------------------------------------
// USER ENTITY
// --------------------------------------------------
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text', unique: true, nullable: true })
    supabaseUserId!: string | null;

    @Column({ type: 'text', unique: true })
    email!: string;

    @Column({ type: 'text', nullable: true })
    passwordHash!: string | null;

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.VIEWER
    })
    role!: UserRole;

    @Column({ type: 'text' })
    organizationId!: string;

    @ManyToOne(() => Organization, (org) => org.users)
    @JoinColumn({ name: 'organizationId' })
    organization!: Organization;

    @CreateDateColumn()
    createdAt!: Date;
}

// --------------------------------------------------
// TASK ENTITY
// --------------------------------------------------
@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'text' })
    category!: string;

    @Column({ type: 'text' })
    status!: string;

    @Column({ type: 'text' })
    organizationId!: string;

    @ManyToOne(() => Organization, (org) => org.tasks)
    @JoinColumn({ name: 'organizationId' })
    organization!: Organization;

    @Column({ type: 'text' })
    createdBy!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdBy' })
    creator!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

// --------------------------------------------------
// AUDIT LOG ENTITY
// --------------------------------------------------
@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    userId!: string;

    @Column({
        type: 'simple-enum',
        enum: ActionType
    })
    action!: ActionType;

    @Column({ type: 'text' })
    resourceType!: string;

    @Column({ type: 'text', nullable: true })
    resourceId!: string;

    @CreateDateColumn()
    timestamp!: Date;
}
