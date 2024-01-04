import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class LoginDto{
    @ApiProperty({  
        description: 'The user email',
        example: 'test@test.com',
        pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, {
        message: 'Invalid email format',
    })
    email: string;

    @ApiProperty({
        description: 'The user password',
        example: '123456',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'The password must be at least 8 characters long',
    })
    password: string;
}