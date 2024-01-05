import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Model, ModifyResult, Types } from 'mongoose';
import { Task } from '../entities/task.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from 'src/user/services/user.service';
import { Document } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TasksService {

  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<Task>,

    @Inject(UserService)
    private readonly userService: UserService,

    @Inject(SchedulerRegistry)
    private readonly schedulerRegistry: SchedulerRegistry,

    @Inject(MailerService)
    private mailerService: MailerService,

  ) {
    taskModel.find().then(tasks => {
      tasks.forEach(task => {
        if(task.haveReminder && task.status !== 'DONE'){
          const cronName = `task-${task.user}-${task._id}`;
          this.createCronJob(cronName, task.reminderFrequency, task.startDate, task.endDate, task);
        }
      })
    });
  }

  private readonly logger = new Logger(TasksService.name);

  async create(createTaskDto: CreateTaskDto, userId: Types.ObjectId): Promise<Task> {
    if(createTaskDto.haveReminder && !createTaskDto.reminderFrequency) throw new NotFoundException('Reminder time is required');
    
    const task = new this.taskModel({
      ...createTaskDto,
      user: userId,
    });

    if(createTaskDto.haveReminder){
      const cronName = `task-${userId}-${task._id}`;
      this.createCronJob(cronName, task.reminderFrequency, task.startDate, task.endDate, task);
    }
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

    if(updateTaskDto.haveReminder && updateTaskDto.status === 'DONE'){
      const cronName = `task-${userId}-${taskId}`;
      this.stopCronJob(cronName);
    }


    const task = await this.taskModel.findById({ _id: taskId, user: userId });

    return task;
  }

  async remove(taskId: Types.ObjectId, userId: Types.ObjectId): Promise<ModifyResult<Document<any, any, Task>>> {
    const taskFinded = await this.taskModel.findById({ _id: taskId, user: userId });
    if(!taskFinded) throw new NotFoundException('Task not found');

    if(taskFinded.haveReminder){
      const cronName = `task-${userId}-${taskId}`;
      this.stopCronJob(cronName);
    }

    const task = await this.taskModel.findByIdAndDelete({ _id: taskId, user: userId });
    await this.userService.removeTask(userId, taskId);
    return task;
  }

  //CRON JOBS

  async createCronJob(name: string, cronTime: string, from: Date, to: Date, task: Task){

    const hour = from.getHours();
    const minute = from.getMinutes();

    const cronMap = {
      'SECONDS': `*/5 * * * * *`,
      'MINUTELY': `0 * * * * *`,
      'DAILY': `0 ${minute} ${hour} * * *`,
      'WEEKLY': `0 ${minute} ${hour} * * 0`,
      'MONTHLY': `0 ${minute} ${hour} 1 * *`,
    }

    const job = new CronJob(
      cronMap[cronTime],
      () => {
        const now = new Date();

        if(now >= from && now <= to){
          this.logger.debug(`Executing cron job ${name}`);
          this.sendReminderEmail(task);
        }
        else if(now > to){
          this.logger.debug(`Stopping cron job ${name}`);
          job.stop();
        }
      }
    );  
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }

  async stopCronJob(name: string){
    const job = this.schedulerRegistry.getCronJob(name);
    this.logger.debug(`Stopping cron job ${name}`);
    job.stop();
  }

  async sendReminderEmail(task: Task): Promise<boolean> {

    const { email } = await this.userService.findOne(new Types.ObjectId(task.user));

    const emailRequest = await this.mailerService
      .sendMail({
        to: email,
        subject: 'Task remainder',
        template: 'remainderTemplate', 
        context: {
          taskName: task.name,
          taskDescription: task.description,
          taskStartDate: task.startDate,
          taskEndDate: task.endDate,
          taskPriority: task.priority,
        }
      })

      if(!emailRequest) {
        throw new HttpException('Email not sent', HttpStatus.INTERNAL_SERVER_ERROR);
      }

    return true;
  }
}
