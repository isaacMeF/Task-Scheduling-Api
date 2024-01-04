import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dto/login/login.dto';

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



  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
