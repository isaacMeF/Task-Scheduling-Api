import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @ApiProperty({
    description: 'The task name',
    example: 'Do something',
  })
  @Prop(String)
  name: string;

  @ApiProperty({
    description: 'The task description',
    example: 'Do something',
  })
  @Prop(String)
  description: string;

  @ApiProperty({
    description: 'The task status',
    example: 'OPEN',
    enum: ['OPEN', 'IN_PROGRESS', 'DONE'],
  })
  @Prop({ type: String, default: 'OPEN', enum: ['OPEN', 'IN_PROGRESS', 'DONE'] })
  status: string;

  @ApiProperty({
    description: 'The task user',
    example: '60f3b4b3e0b3f3b3b4f3b3b3',
  })
  @Prop({ type: String, ref: 'User' })
  user: string;

  @ApiProperty({
    description: 'start date of the task',
  })
  @Prop(Date)
  startDate: Date;

  @ApiProperty({
    description: 'end date of the task',
  })
  @Prop(Date)
  endDate: Date;

  @ApiProperty({
    description: 'The task priority',
    example: 'LOW',
  })
  @Prop({ type: String, default: 'LOW', enum: ['LOW', 'MEDIUM', 'HIGH'] })
  priority: string;

  @ApiProperty({
    description: 'have Reminder',
    example: true,
  })
  @Prop(Boolean)
  haveReminder: boolean;

  @ApiProperty({
    description: 'The task reminder frequency',
    example: 'DAILY',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'MINUTELY'],
    default: null
  })
  @Prop({ type: String, default: null, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'MINUTELY'] })
  reminderFrequency: string;

}

export const TaskSchema = SchemaFactory.createForClass(Task);
