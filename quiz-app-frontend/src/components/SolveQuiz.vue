<template>
  <v-container>
    <v-card class="mx-auto my-12" max-width="800">
      <v-card-title class="d-flex align-center">
        <v-icon large class="mr-2">mdi-book-education</v-icon>
        Quiz lösen
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submitQuiz" v-model="formValid">
          <v-divider class="my-4"></v-divider>

          <div v-for="(question, index) in questions" :key="index">
            <v-card outlined class="my-4">
              <v-card-title>{{ question.id }}. {{ question.question }}</v-card-title>
              <v-card-text>
                <v-radio-group
                  v-model="answers[question.id]"
                  :rules="[v => !!v || 'Bitte wählen Sie eine Antwort']"
                >
                  <v-radio
                    v-for="(answerText, answerKey) in question.answers"
                    :key="answerKey"
                    :value="answerKey"
                    :label="answerText"
                  ></v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </div>

          <v-btn type="submit" color="primary" class="mr-4">Quiz abschicken</v-btn>
        </v-form>

        <v-snackbar v-model="toast.visible" :color="toast.color" top>
          {{ toast.message }}
          <v-btn color="white" @click="toast.visible = false">Schließen</v-btn>
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {QuestionWithoutCorrectAnswerDto, QuizApi, QuizSolutionDto} from "../app";
import {OpenAPIDefaultConfig} from "../utils/openAPIDefaultConfig";

export default defineComponent({
  name: 'SolveQuiz',
  setup() {
    const route = useRoute();
    const course = ref<string>(route.query.course as string || '');
    const quizId = ref<string>(route.query.quizId as string || '');
    const studentId = ref<string>(route.query.studentId as string || '');
    const questions = ref<QuestionWithoutCorrectAnswerDto[]>([]);
    const answers = ref<{ [key: number]: number | null }>({});
    const formValid = ref<boolean>(true);
    const toast = ref({
      visible: false,
      message: '',
      color: '',
    });

    onMounted(async () => {
      await fetchQuiz();
    });

    const fetchQuiz = async () => {
      const quizApi = new QuizApi(OpenAPIDefaultConfig);
      const response = await quizApi.quizControllerGetQuestionsWithoutAnswers(course.value, quizId.value);
      questions.value = response.data;
      initializeAnswers();
    };

    const initializeAnswers = () => {
      for (const question of questions.value) {
        answers.value[question.id] = null;
      }
    };

    const validateForm = (): boolean => {
      for (const questionId in answers.value) {
        if (answers.value[questionId] === null) {
          return false;
        }
      }
      return true;
    };

    const submitQuiz = async () => {
      if (validateForm()) {

        try {

          const quizSolution:QuizSolutionDto = {
            answers: answers.value
          }
          const quizApi = new QuizApi(OpenAPIDefaultConfig);

          const response = await quizApi.quizControllerAddQuizSolution(course.value, quizId.value, studentId.value, quizSolution);

          if ([200, 201].includes(response.status)) {
            showToast('Quiz erfolgreich abgeschickt!', 'green');
          } else {
            showToast('Fehler beim Abschicken des Quizzes.', 'red');
          }
        } catch (error) {
          showToast('Fehler beim Abschicken des Quizzes.', 'red');
        }
      } else {
        showToast('Bitte beantworten Sie alle Fragen.', 'red');
      }
    };

    const showToast = (message: string, color: string) => {
      toast.value = {
        visible: true,
        message,
        color,
      };
    };

    return {
      questions,
      answers,
      formValid,
      toast,
      submitQuiz,
    };
  },
});
</script>

<style>
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.my-12 {
  margin-top: 48px;
  margin-bottom: 48px;
}

.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>
