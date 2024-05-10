// src/quiz/quiz.controller.ts
import {Controller, Get, Post, Param, Body, Patch, BadRequestException} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {QuizService} from './quiz.service';
import {QuestionWithCorrectAnswerDto} from "./question-with-correct-answer.dto";
import {StudentService} from "../student/student.service";
import {QuizSolutionDto} from "./quiz-solution.dto";
import {generateFilename} from "../utils/generateFileName";
import {QuestionWithoutCorrectAnswerDto} from "./question-without-correct-answer.dto";

@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
    constructor(
        private readonly quizService: QuizService,
        private readonly studentService: StudentService,
        ) {}

    @Post('addQuiz/course/:courseName/quiz/:quizId')
    @ApiOperation({ summary: 'Fügt ein Quiz zu einem Kurs hinzu' })
    @ApiResponse({ status: 200, description: 'Quiz erfolgreich hinzugefügt'})
    @ApiBody({
        description: 'Array von Fragen mit richtigen Antworten',
        isArray: true,
        type: QuestionWithCorrectAnswerDto,
    })
    addQuiz(
        @Param('courseName') courseName: string,
        @Param('quizId') quizId: string,
        @Body() questions: QuestionWithCorrectAnswerDto[],
    ) {
        const courseDir = generateFilename(courseName);
        this.quizService.addQuizToCourse(courseDir, quizId, questions);
        return { message: `Quiz '${quizId}' erfolgreich zum Kurs '${courseDir}' hinzugefügt` };
    }

    @Get('getQuizQuestions/course/:course/quizId/:quizId')
    @ApiOperation({ summary: 'Gibt alle Fragen eines bestimmten Quizzes ohne Antworten zurück' })
    @ApiResponse({
        status: 200,
        description: 'Eine Liste der Fragen eines Quizzes ohne Antworten',
        isArray: true,
        type: QuestionWithoutCorrectAnswerDto,
    })
    async getQuestionsWithoutAnswers(
        @Param('course') courseName: string,
        @Param('quizId') quizId: string
    ): Promise<QuestionWithoutCorrectAnswerDto[]> {

        const courseDir = generateFilename(courseName);
        const quizWithoutAnswers = this.quizService.getQuestionsWithoutAnswers(courseDir, quizId);

        return quizWithoutAnswers;
    }



    @Post('addQuizSolution/course/:courseName/quiz/:quizId/student/:studentId')
    @ApiOperation({
        summary: 'Fügt eine Quiz-Lösung für einen bestimmten Studenten hinzu',
    })
    @ApiBody({
        description: 'Quiz-Lösung für einen Studenten',
        type: QuizSolutionDto,
    })
    addQuizSolution(
        @Param('courseName') courseName: string,
        @Param('quizId') quizId: string,
        @Param('studentId') studentId: string,
        @Body() solution: QuizSolutionDto,
    ) {
        const courseDir = generateFilename(courseName);
        const dateNow = new Date();
        const editableTill = this.quizService.getEditableTill(courseDir, quizId);

        if(editableTill < dateNow) {
            throw new BadRequestException(`Das Quiz '${quizId}' darf nicht mehr bearbeitet werden. Bearbeitungsfrist war '${editableTill}'`);
        }

        this.quizService.addSolutionToQuiz(courseDir, quizId, studentId, solution);
        return { message: `Lösung für Quiz '${quizId}' von Student '${studentId}' erfolgreich hinzugefügt` };
    }

    @Patch('updateEditableTill/course/:courseName/quiz/:quizId/:timestamp')
    @ApiOperation({
        summary: 'Aktualisiert die "editableTill"-Eigenschaft eines Quizzes',
    })
    updateEditableTill(
        @Param('courseName') courseName: string,
        @Param('quizId') quizId: string,
        @Param('timestamp') timestamp: string,
    ) {
        const courseDir = generateFilename(courseName);
        const newEditableTill = new Date(timestamp);

        this.quizService.updateEditableTill(courseDir, quizId, newEditableTill)
        const students = this.studentService.getStudentsByCourseName(courseName);
        this.studentService.notifyStudentsQuizAvailable(courseName, students, quizId, newEditableTill);

        return {
            message: `Bearbeitungsfrist für Quiz '${quizId}' erfolgreich aktualisiert`,
            editableTill: newEditableTill.toISOString(),
        };
    }
}
