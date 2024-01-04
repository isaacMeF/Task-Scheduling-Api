import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Model, ModifyResult, Types } from 'mongoose';
import { Task } from '../entities/task.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/services/user.service';
import { Document } from 'mongoose';

@Injectable()
export class TasksService {

  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<Task>,

    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: Types.ObjectId): Promise<Task> {
    const task = new this.taskModel({
      ...createTaskDto,
      user: userId,
    });
    await this.userService.addTask(userId, task._id);
    return await task.save();
  }

  async findAll(userId: Types.ObjectId): Promise<Task[]>{
    return await this.taskModel.find({ user: userId });
  }

  async findOne(taskId: Types.ObjectId, userId: Types.ObjectId): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId, user: userId });
    if(!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(taskId: Types.ObjectId, userId: Types.ObjectId, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const updatedTask = await this.taskModel.findByIdAndUpdate({ _id: taskId, user: userId }, updateTaskDto);
    if(!updatedTask) throw new NotFoundException('Task not found');

    const task = await this.taskModel.findById({ _id: taskId, user: userId });

    return task;
  }

  async remove(taskId: Types.ObjectId, userId: Types.ObjectId): Promise<ModifyResult<Document<any, any, Task>>> {
    const task = await this.taskModel.findByIdAndDelete({ _id: taskId, user: userId });
    await this.userService.removeTask(userId, taskId);
    if(!task) throw new NotFoundException('Task not found');
    return task;
  }
}
