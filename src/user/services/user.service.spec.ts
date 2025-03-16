import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { LoginDto } from '../dto/login/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';


jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUserModel = jest.fn().mockImplementation(function (dto: CreateUserDto) {
  this.save = jest.fn().mockResolvedValue({
    ...dto,
    _id: '60f3b4b3e0b3f3b3b4f3b3b3',
  });
});

(mockUserModel as any).findOne = jest.fn().mockResolvedValue({
  _id: '60f3b4b3e0b3f3b3b4f3b3b3',
  name: 'John Doe',
  email: 'test@test.com',
  password: 'hashed_password',
  tasks: [],
  isVerified: true,
  verificationCode: null,
});

const mockUserModelLogin = jest.fn().mockResolvedValue(function () {
  return {
    access_token: 'fake-jwt-token',
    expiresIn: '60s',
  }
});

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
};

const mockMailerService = {
  sendMail: jest.fn().mockResolvedValue(true),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test',
          signOptions: { expiresIn: '60s' },
        }),
        MailerModule.forRoot({
          transport: 'smtps://test:$test@smtp.gmail.com',
          defaults: { from: '"Task Manager" <test>' },
        }),
      ],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto = { name: 'John Doe', email: 'john@test.com', password: '12345678' };

    const result = await service.create(createUserDto);

    expect(mockUserModel).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'hashed_password',
    });

    expect(result).toEqual({
      _id: '60f3b4b3e0b3f3b3b4f3b3b3',
      name: 'John Doe',
      email: 'john@test.com',
      password: 'hashed_password',
    });
  });
});