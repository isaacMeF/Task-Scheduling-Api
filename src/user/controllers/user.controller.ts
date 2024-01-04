import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login/login.dto';
import { UserGuard } from '../guards/user.guard';
import { Response } from 'express';
import { Types } from 'mongoose';

@Controller('/api/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: User })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Post('/login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK })
  async login(@Body() loginDto: LoginDto): Promise<{access_token: string, expiresIn: string}> {
    return this.userService.login(loginDto.email, loginDto.password);
  }

  @Get('/verify-account/:email')
  @ApiResponse({ status: HttpStatus.OK })
  async verify(@Param('email') email: string, @Query('validationCode') validationCode: string, res: Response): Promise<any> {
    const validatedUser = await this.userService.validateUser(email, validationCode);

    if(!validatedUser) throw new UnauthorizedException('Invalid validation code');
    
    return {
      message: 'User verified', 
      statusCode: HttpStatus.OK,
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.update(new Types.ObjectId(id), updateUserDto);
  }
}
