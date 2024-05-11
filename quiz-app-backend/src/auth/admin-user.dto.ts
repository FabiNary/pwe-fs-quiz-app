import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AdminUserDto {
    @ApiProperty({
        description: 'Username',
        example: 'Hans Müller',
    })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'Passwort des Users',
        example: 'password',
    })
    @IsString()
    password: string;
}
