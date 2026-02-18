import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) { }

    async updateUser(id: string, updateData: Partial<User>) {
        await this.usersRepository.update(id, updateData);
        return this.usersRepository.findOne({ where: { id } });
    }
}
