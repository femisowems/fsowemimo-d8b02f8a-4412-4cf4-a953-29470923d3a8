import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@secure-task-management/auth/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUsersService = {
    updateUser: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    })
      .overrideGuard(AuthGuard('supabase-jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a specific user', async () => {
    const req = { 
      user: { id: 'user-1', role: 'Owner' },
      params: { id: 'user-1' } 
    };
    const body = { name: 'Test User' };
    mockUsersService.updateUser.mockResolvedValue({
      id: 'user-1',
      ...body,
    } as any);

    const result = await controller.updateUser(req, 'user-1', body);

    expect(service.updateUser).toHaveBeenCalledWith('user-1', body);
    expect(result).toEqual({ id: 'user-1', name: 'Test User' });
  });

  it('should update preferences for the current user', async () => {
    const req = { user: { id: 'self-user' } };
    const preferences = 'light';
    mockUsersService.updateUser.mockResolvedValue({
      id: 'self-user',
      preferences,
    } as any);

    const result = await controller.updatePreferences(req, preferences);

    expect(service.updateUser).toHaveBeenCalledWith('self-user', {
      preferences,
    });
    expect(result).toEqual({ id: 'self-user', preferences: 'light' });
  });
});
