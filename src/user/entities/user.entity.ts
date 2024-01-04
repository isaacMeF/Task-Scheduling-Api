import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @ApiProperty({
    description: 'The user name',
    example: 'John Doe',
  })
  @Prop(String)
  name: string;

  @ApiProperty({
    description: 'The user email',
    example: 'test@test.com',
  })
  @Prop({ unique: true })
  email: string;

  @ApiProperty({
    description: 'The user password',
    example: '123456',
  })
  @Prop(String)
  password: string; 

  @ApiProperty({
    description: 'Tasks assigned to the user',
    isArray: true,
    example: ['60f3b4b3e0b3f3b3b4f3b3b3'],
  })
  @Prop([{ type: [String], ref: 'Task' }])
  tasks: string[];

  @ApiProperty({
    description: 'Is account verified?',
    example: true,
  })
  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @ApiProperty({
    description: 'The user verification code',
    example: '23432',
  })
  @Prop({ type: String, default: null })
  verificationCode: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
