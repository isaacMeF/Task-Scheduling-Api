import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { ApiBearerAuth, ApiBody, ApiNotFoundResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserGuard } from '../../user/guards/user.guard';
import { Task } from '../entities/task.entity';
import { Types } from 'mongoose';

@Controller('/api/tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(UserGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('/create')
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
    const userId = req.user.sub;
    return await this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'get tasks' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(@Request() req): Promise<Task[]> {
    const userId = req.user.sub;
    return await this.tasksService.findAll(userId);
  }

  @Get(':id')
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiResponse({ status: 200, description: 'get task by id' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Task> {
    const userId = req.user.sub;
    return await this.tasksService.findOne((id as unknown as Types.ObjectId), userId);
  }

  @Patch('/update/:id')
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req): Promise<Task> {
    const userId = req.user.sub;
    return await this.tasksService.update((id as unknown as Types.ObjectId), userId, updateTaskDto);
  }

  @Delete('/delete/:id')
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return await this.tasksService.remove((id as unknown as Types.ObjectId), userId);
  }
}
