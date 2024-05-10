import { ApiProperty } from '@nestjs/swagger';

export class AddStudentsAsCsvDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}