import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class EditableTillDto {
    @ApiProperty({
        description: 'Bearbeitungszeitraum',
        example: '2024-02-01T09:00:22',
    })
    @IsString()
    editableTill: string | null;
}