import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';

describe('UsersService', () => {
    let service: UsersService;

    const mockUsersRepository = {
        update: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update user and return the updated user', async () => {
        const mockUser = { id: 'user-1', preferences: 'dark' };
        mockUsersRepository.update.mockResolvedValue({ affected: 1 });
        mockUsersRepository.findOne.mockResolvedValue(mockUser);

        const result = await service.updateUser('user-1', { preferences: 'dark' } as any);

        expect(mockUsersRepository.update).toHaveBeenCalledWith('user-1', { preferences: 'dark' });
        expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
        expect(result).toEqual(mockUser);
    });
});
