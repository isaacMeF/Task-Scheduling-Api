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
}

export const UserSchema = SchemaFactory.createForClass(User);
