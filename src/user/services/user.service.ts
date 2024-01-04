import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<UserDocument>,

    @Inject(JwtService)
    private jwtService: JwtService

  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;
    const user = new this.userModel({
      name,
      email,
      password: await this.encriptPassword(password),
    });
    return await user.save();
  }

  async login(email: string, password: string): Promise<{access_token: string, expiresIn: string}> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { name: user.name, email: user.email, sub: user._id };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.USER_SECRET_KEY,
        expiresIn: process.env.EXPIRES_IN,
      }),
      expiresIn: process.env.EXPIRES_IN,
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async encriptPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
}
