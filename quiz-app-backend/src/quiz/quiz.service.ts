import { Injectable, NotFoundException } from '@nestjs/common';
import {writeFileSync, existsSync, readFileSync, readdirSync} from 'fs';
import { join } from 'path';
import {QuestionWithCorrectAnswerDto} from "./question-with-correct-answer.dto";
import {QuizDto} from "./quiz.dto";
import {QuizSolutionDto} from "./quiz-solution.dto";
import {QuestionWithoutCorrectAnswerDto} from "./question-without-correct-answer.dto";
import {ConfigService} from "@nestjs/config";



@Injectable()
export class QuizService {
    private readonly baseDir: string;
    constructor(
        private readonly configService: ConfigService
    ) {
        this.baseDir = configService.get<string>('QUIZ_DATA_DIR');
    }

    getQuestionsWithoutAnswers(courseDir: string, quizId: string) {
        const quizPath = join(this.baseDir, courseDir, 'quizzes', `${quizId}.json`);

        if (!existsSync(quizPath)) {
            throw new NotFoundException(`Quiz '${quizId}' im Kurs '${courseDir}' nicht gefunden`);
        }

        const quiz: QuizDto = JSON.parse(readFileSync(quizPath, 'utf8'));
        return quiz.questions.map(({ correctAnswer, ...rest }) => rest as QuestionWithoutCorrectAnswerDto)
    }

    addQuizToCourse(courseDir: string, quizId: string, questions: QuestionWithCorrectAnswerDto[]): void {

        if (!existsSync(join(this.baseDir, courseDir))) {
            throw new NotFoundException(`Kursverzeichnis '${courseDir}' nicht gefunden.`);
        }

        const quizFileName = `${quizId}.json`

        if(existsSync(join(this.baseDir, courseDir, 'quizzes', quizFileName))) {
            throw new NotFoundException(`Quiz existiert bereits`);
        }

        const quiz: QuizDto = {
            id: quizId,
            created: new Date().toISOString(),
            editableTill: new Date().toISOString(),
            questions: questions,
            answers: {}
        }

        writeFileSync(join(this.baseDir, courseDir, 'quizzes', quizFileName), JSON.stringify(quiz, null, 2));
    }

    addSolutionToQuiz(courseName: string, quizId: string, studentId: string, solution: QuizSolutionDto) {
        const quizPath = join(this.baseDir, courseName, 'quizzes', `${quizId}.json`);

        if (!existsSync(quizPath)) {
            throw new NotFoundException(`Quiz '${quizId}' im Kurs '${courseName}' nicht gefunden`);
        }

        const quizData = JSON.parse(readFileSync(quizPath, 'utf-8'));

        if (!quizData.answers) {
            quizData.answers = {};
        }

        quizData.answers[studentId] = solution.answers;

        writeFileSync(quizPath, JSON.stringify(quizData, null, 2));
    }

    getQuizzesByCourseDir(courseDir: string): {[s: string]: QuizDto} {
        return readdirSync(join(this.baseDir, courseDir, 'quizzes')).reduce((previousValue, currentValue) => {
            const quiz: QuizDto = JSON.parse(readFileSync(join(this.baseDir, courseDir, 'quizzes', currentValue), 'utf8'));
            const newValue = {...previousValue};
            newValue[currentValue.replace('.json', '')] = quiz;
            return newValue;
        }, {});
    }

    getEditableTill(courseName: string, quizId: string): Date {
        const quizPath = join(this.baseDir, courseName, 'quizzes', `${quizId}.json`);
        if (!existsSync(quizPath)) {
           return null;
        }
        const quizData = JSON.parse(readFileSync(quizPath, 'utf-8'));
        return new Date(quizData.editableTill);
    }

    updateEditableTill(courseDir: string, quizId: string, editableTill: Date) {
        const quizPath = join(this.baseDir, courseDir, 'quizzes', `${quizId}.json`);
        if (!existsSync(quizPath)) {
            throw new NotFoundException(`Quiz '${quizId}' im Kurs '${courseDir}' nicht gefunden`);
        }

        const quizData = JSON.parse(readFileSync(quizPath, 'utf-8'));
        quizData.editableTill = new Date(editableTill).toISOString();

        writeFileSync(quizPath, JSON.stringify(quizData, null, 2));
    }
}
