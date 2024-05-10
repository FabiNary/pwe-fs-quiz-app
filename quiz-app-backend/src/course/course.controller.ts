import {Controller, Get, Param, Post, Res, StreamableFile} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiParam, ApiResponse} from '@nestjs/swagger';
import { Response } from 'express';
import { CourseService } from './course.service';
import {generateFilename} from "../utils/generateFileName";

@ApiTags('Courses')
@Controller('course')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
    ) {}

    @Post('addCourse/:courseName')
    @ApiOperation({ summary: 'Fügt einen Kurs hinzu und erstellt ein Verzeichnis' })
    @ApiParam({ name: 'courseName', description: 'Name des Kurses', type: String })
    @ApiResponse({ status: 201, description: 'Kurs erfolgreich hinzugefügt' })
    addCourse(@Param('courseName') courseName: string) {
        this.courseService.createCourseDirectory(courseName);
        return { message: `Kurs '${courseName}' erfolgreich hinzugefügt` };
    }

    @Get('getCourses')
    @ApiOperation({ summary: 'Gibt eine Liste aller Kurse zurück' })
    @ApiResponse({
        status: 200,
        description: 'Eine Liste aller Kurse',
        isArray: true,
        type: String,
    })
    getCourses() {
        return this.courseService.listCourses();
    }

    @Get(':courseName/solutions')
    @ApiOperation({
        summary: 'Gibt eine ZIP-Datei mit allen Studentenantworten als CSV zurück',
    })
    async getStudentSolutionsAsZip(@Param('courseName') courseName: string, @Res({ passthrough: true }) res: Response) {
        res.header('Content-Type', 'application/zip');
        res.header('Content-Disposition', `attachment; filename="${generateFilename(courseName)}-solutions.zip"`);

        const zipFile = await this.courseService.getStudentSolutionsAsZip(courseName);
        return new StreamableFile(zipFile);
    }
}
