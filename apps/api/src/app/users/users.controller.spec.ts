import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@fsowemimo-d8b02f8a-4412-4cf4-a953-29470923d3a8/data/entities';

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    const mockUsersService = {
        updateUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update a specific user', async () => {
        const req = { params: { id: 'user-1' } };
        const body = { name: 'Test User' };
        mockUsersService.updateUser.mockResolvedValue({ id: 'user-1', ...body } as unknown as User);

        const result = await controller.updateUser(req, body);

        expect(service.updateUser).toHaveBeenCalledWith('user-1', body);
        expect(result).toEqual({ id: 'user-1', name: 'Test User' });
    });

    it('should update preferences for the current user', async () => {
        const req = { user: { id: 'self-user' } };
        const preferences = { theme: 'light' };
        mockUsersService.updateUser.mockResolvedValue({ id: 'self-user', preferences } as unknown as User);

        const result = await controller.updatePreferences(req, preferences);

        expect(service.updateUser).toHaveBeenCalledWith('self-user', { preferences });
        expect(result).toEqual({ id: 'self-user', preferences });
    });
});
