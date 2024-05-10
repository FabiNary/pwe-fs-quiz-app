<template>
  <v-container>
    <v-card class="mx-auto my-12" max-width="800">
      <v-card-title class="d-flex align-center">
        <v-icon large class="mr-2">mdi-book-education</v-icon>
        Quiz-Erstellung
      </v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="submitQuiz" v-model="formValid">
          <div v-for="(question, index) in questions" :key="index">
            <v-text-field
              v-model="question.question"
              :label="'Frage ' + (index + 1)"
              required
              :rules="[v => !!v || 'Frage erforderlich']"
              prepend-icon="mdi-help-circle"
            ></v-text-field>

            <div v-for="i in 4" :key="i">
              <v-text-field
                v-model="question.answers[i]"
                :label="'Antwort ' + i"
                required
                :rules="[v => !!v || 'Antwort ' + i + ' erforderlich']"
                prepend-icon="mdi-check-circle"
              ></v-text-field>
            </div>

            <v-select
              v-model="question.correctAnswer"
              :items="Array.from({ length: 4 }, (_, i) => i + 1)"
              label="Richtige Antwort"
              required
              :rules="[v => !!v || 'Richtige Antwort erforderlich']"
              prepend-icon="mdi-checkbox-marked-circle-outline"
            ></v-select>

            <v-divider class="my-4"></v-divider>
          </div>

          <v-btn type="submit" color="primary" class="mr-4">Quiz erstellen</v-btn>
        </v-form>

        <v-snackbar v-model="toast.visible" :color="toast.color" top>
          {{ toast.message }}
          <v-btn color="white" text @click="toast.visible = false">Schließen</v-btn>
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import {Configuration, QuestionWithCorrectAnswerDto, QuizApi} from "../app";
import {OpenAPIDefaultConfig} from "../utils/openAPIDefaultConfig";

export default defineComponent({
  name: 'CreateQuiz',
  setup() {
    const route = useRoute();
    const course = ref<string>(route.query.course as string || '');
    const quizId = ref<string>(route.query.quizId as string || '');
    const studentId = ref<string>(route.query.student as string || '');
    const questions = ref<Array<QuestionWithCorrectAnswerDto>>(
      Array.from({ length: 2 }, (_, index) => ({
        id: index + 1,
        question: '',
        answers: {
          1: '',
          2: '',
          3: '',
          4: '',
        },
        correctAnswer: null,
      }))
    );
    const formValid = ref<boolean>(true);
    const toast = ref({
      visible: false,
      message: '',
      color: '',
    });

    const submitQuiz = async () => {
      if (validateForm()) {

        try {
          const quizApi = new QuizApi(OpenAPIDefaultConfig);

          const response = await quizApi.quizControllerAddQuiz(course.value, quizId.value, questions.value)

          if ([200, 201].includes(response.status)) {
            showToast('Quiz erfolgreich erstellt!', 'green');
          } else {
            showToast('Fehler beim Erstellen des Quizzes.', 'red');
          }
        } catch (error) {
          showToast('Fehler beim Erstellen des Quizzes.', 'red');
        }
      } else {
        showToast('Bitte füllen Sie alle Felder korrekt aus.', 'red');
      }
    };

    const validateForm = () => {
      for (const question of questions.value) {
        if (
          !question.question ||
          !question.answers[1] ||
          !question.answers[2] ||
          !question.answers[3] ||
          !question.answers[4] ||
          question.correctAnswer == null
        ) {
          return false;
        }
      }
      return true;
    };

    const showToast = (message: string, color: string) => {
      toast.value = {
        visible: true,
        message,
        color,
      };
    };

    return {
      course,
      quizId,
      studentId,
      questions,
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
