import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @ApiProperty({
    description: 'The task name',
    example: 'Do something',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The task description',
    example: 'Do something',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The task status',
    example: 'OPEN',
    enum: ['OPEN', 'IN_PROGRESS', 'DONE'],
    default: 'OPEN',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'DONE'])
  status?: string;

  user: string;

  @ApiProperty({
    description: 'start date of the task',
    example: '2021-07-19T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    description: 'end date of the task',
    example: '2021-07-19T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({
    description: 'The task priority',
    example: 'LOW',
    default: 'LOW',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority?: string;

  @ApiProperty({
    description: 'have Reminder',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  haveReminder: boolean;

  
  @ApiProperty({
    description: 'The task reminder frequency',
    example: 'DAILY',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    default: null,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  reminderFrequency?: string;
}

