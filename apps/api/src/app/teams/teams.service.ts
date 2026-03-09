import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Team,
  User,
} from '@secure-task-management/data';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActionType } from '@secure-task-management/data/enums';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventEmitter: EventEmitter2
  ) {}

  async create(user: User, data: { name: string; description?: string }) {
    const team = this.teamsRepository.create({
      name: data.name,
      description: data.description,
      organizationId: user.organizationId,
    });

    const savedTeam = await this.teamsRepository.save(team);

    this.eventEmitter.emit('audit.log', {
      action: ActionType.CREATE,
      resourceType: 'TEAM',
      resourceId: savedTeam.id,
      userId: user.id,
      organizationId: user.organizationId,
      meta: { teamName: data.name },
    });

    return savedTeam;
  }

  async findAll(user: User) {
    return this.teamsRepository.find({
      where: { organizationId: user.organizationId },
      relations: ['members'],
    });
  }

  async addMember(user: User, teamId: string, memberId: string) {
    const team = await this.teamsRepository.findOne({
      where: { id: teamId, organizationId: user.organizationId },
      relations: ['members'],
    });
    if (!team) throw new NotFoundException('Team not found');

    const memberToAdd = await this.usersRepository.findOne({
      where: { id: memberId, organizationId: user.organizationId },
    });
    if (!memberToAdd) throw new BadRequestException('User not found in organization');

    if (!team.members.some((m) => m.id === memberId)) {
      team.members.push(memberToAdd);
      await this.teamsRepository.save(team);

      this.eventEmitter.emit('audit.log', {
        action: ActionType.UPDATE,
        resourceType: 'TEAM',
        resourceId: team.id,
        userId: user.id,
        organizationId: user.organizationId,
        meta: { addedUserId: memberId },
      });
    }

    return team;
  }

  async removeMember(user: User, teamId: string, memberId: string) {
    const team = await this.teamsRepository.findOne({
      where: { id: teamId, organizationId: user.organizationId },
      relations: ['members'],
    });
    if (!team) throw new NotFoundException('Team not found');

    team.members = team.members.filter((m) => m.id !== memberId);
    await this.teamsRepository.save(team);

    this.eventEmitter.emit('audit.log', {
      action: ActionType.UPDATE,
      resourceType: 'TEAM',
      resourceId: team.id,
      userId: user.id,
      organizationId: user.organizationId,
      meta: { removedUserId: memberId },
    });

    return team;
  }
}
