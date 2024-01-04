import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, PreconditionFailedException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types  } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<UserDocument>,

    @Inject(JwtService)
    private jwtService: JwtService,

    @Inject(MailerService)
    private mailerService: MailerService,

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

    if(!user.isVerified){
      if(!user.verificationCode){
        const validationCode = await this.generateValidationCode(user._id);
        await this.sendVerificationEmail(validationCode, user.email);
      }
      throw new PreconditionFailedException('User not verified, please check your email');
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

  async sendVerificationEmail(validationCode: string, email: string): Promise<void> {
    const emailRequest = await this.mailerService
      .sendMail({
        to: email,
        subject: 'Validate your account',
        template: 'twoStepsValidation', 
        context: {
          verificationCode: validationCode,
        }
      })

      if(!emailRequest) {
        throw new HttpException('Email not sent', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  async validateUser(email: string, validationCode: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new UnprocessableEntityException('Account already verified');
    }
    if (user.verificationCode !== validationCode) {
      throw new PreconditionFailedException('Invalid validation code');
    }
    await this.userModel.findByIdAndUpdate(user._id, { isVerified: true, verificationCode: null });

    return true;
  }

  async generateValidationCode(id: Types.ObjectId): Promise<string> {
    const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const updatedUser = await this.userModel.findByIdAndUpdate(id, { verificationCode: validationCode });
    
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return validationCode;
  }

  async update(id: Types.ObjectId, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  async encriptPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async addTask(userId: Types.ObjectId, taskId: Types.ObjectId): Promise<User> {
    return await this.userModel.findByIdAndUpdate(userId, { $push: { tasks: taskId } });
  }

  async removeTask(userId: Types.ObjectId, taskId: Types.ObjectId): Promise<User> {
    return await this.userModel.findByIdAndUpdate(userId, { $pull: { tasks: taskId } });
  }
}
