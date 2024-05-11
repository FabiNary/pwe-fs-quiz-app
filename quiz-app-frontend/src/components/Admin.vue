<template>
  <v-container>
    <v-card class="mx-auto my-12" max-width="1200">
      <v-card-title class="d-flex align-center">
        <v-icon large class="mr-2">mdi-school</v-icon>
        Admin Dashboard
      </v-card-title>
      <v-card-text>
        <v-divider class="my-4"></v-divider>

        <!-- Kursliste und Kurs erstellen -->
        <v-row>
          <v-col cols="6">
            <v-list>
              <v-list-item-group v-model="selectedCourse">
                <v-list-item
                  v-for="course in courses"
                  :key="course"
                  :value="course"
                  @click="selectCourse(course)"
                >
                  <v-list-item-content>{{ course }}</v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-col>
          <v-col cols="5">
            <v-form @submit.prevent="createCourse">
              <v-text-field
                v-model="newCourseName"
                label="Neuen Kurs erstellen"
                :rules="[v => !!v || 'Bitte Kursnamen eingeben']"
              ></v-text-field>
              <v-btn type="submit" color="primary">Kurs erstellen</v-btn>
            </v-form>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- CSV-Upload -->
        <v-row>
          <v-col cols="6">
            <v-file-input
              v-model="csvFile"
              label="Teilnehmerliste (CSV) hochladen"
              prepend-icon="mdi-file-upload"
              accept=".csv"
            ></v-file-input>
          </v-col>
          <v-col cols="6">
            <v-btn @click="uploadCsv" color="primary">CSV hochladen</v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Teilnehmer eines Kurses anzeigen -->
        <v-row v-if="selectedCourse">
          <v-col cols="12">
            <h2>Teilnehmer im Kurs "{{ selectedCourse }}"</h2>
            <v-list>
              <v-list-item-group>
                <v-list-item v-for="student in students" :key="student.id">
                  <v-list-item-content>{{ student.name }} ({{ student.email }})</v-list-item-content>
                  <v-list-item-action>
                    <v-text-field
                      v-model="studentQuizPeriods[student.quizCreationId]"
                      label="Bearbeitungszeitraum ändern"
                      type="datetime-local"
                    ></v-text-field>
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn @click="updateQuizPeriod(student.quizCreationId)" color="primary">Aktualisieren</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <v-divider class="my-4"></v-divider>
            <v-btn @click="downloadQuizResults" color="primary">Quiz-Ergebnisse herunterladen</v-btn>
          </v-col>
        </v-row>

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
import { OpenAPIDefaultConfig } from '../utils/openAPIDefaultConfig';
import {CoursesApi, QuizApi, StudentApi, StudentDto} from '../app';
import { useObjectUrl } from '@vueuse/core'
export default defineComponent({
  name: 'Admin',
  setup() {
    const courses = ref<string[]>(['Platzhalter Kurs 1', 'Platzhalter Kurs 2']);
    const students = ref<StudentDto[]>([]);
    const selectedCourse = ref<string | null>(null);
    const newCourseName = ref<string>('');
    const csvFile = ref<File | null>(null);
    const studentQuizPeriods = ref<{ [key: string]: string }>({});
    const toast = ref({
      visible: false,
      message: '',
      color: '',
    });
    const courseApi = new CoursesApi(OpenAPIDefaultConfig);
    const studentApi = new StudentApi(OpenAPIDefaultConfig);
    const quizApi = new QuizApi(OpenAPIDefaultConfig);

    const fetchCourses = async () => {
      const response = await courseApi.courseControllerGetCourses();
      courses.value = response.data;
    };

    const selectCourse = async (course: string) => {
      selectedCourse.value = course;
      await fetchStudentsByCourse(course);
    };

    const fetchStudentsByCourse = async (course: string) => {
      const response = await studentApi.studentControllerGetStudentsByCourse(course);

      if ([200, 201].includes(response.status)) {
        students.value = response.data;
        initializeStudentQuizPeriods().then(r => r);
        return;
      }

      showToast('Es ist ein Fehler aufgetreten', 'red');
    };

    const initializeStudentQuizPeriods = async () => {
      studentQuizPeriods.value = {};
      for (const student of students.value) {
        const response = await quizApi.quizControllerGetEditableTill(selectedCourse.value, student.quizCreationId);

        if (![200, 201].includes(response.status)) continue;
        if(!response.data.editableTill) continue;

        studentQuizPeriods.value[student.quizCreationId] = formatDateTimeLocal(new Date(response.data.editableTill).toISOString());


      }
    };

    const createCourse = async () => {
      if (newCourseName.value !== '' && !newCourseName.value) {
        showToast('Bitte geben Sie einen Kursnamen ein.', 'red');
        return;
      }

      const response = await courseApi.courseControllerAddCourse(newCourseName.value);

      if ([200, 201].includes(response.status)) {
        courses.value.push(newCourseName.value);
        newCourseName.value = '';
        showToast('Kurs erfolgreich erstellt!', 'green');
        return;
      }

      showToast('Es ist ein Fehler aufgetreten', 'red');
    };

    const uploadCsv = async () => {
      if (!csvFile.value || !selectedCourse.value) {
        showToast('Bitte wählen Sie eine CSV-Datei und einen Kurs aus.', 'red');
        return;
      }

      const response = await studentApi.studentControllerAddStudentsAsCsv(selectedCourse.value, csvFile.value);

      if ([200, 201].includes(response.status)) {
        showToast('CSV erfolgreich hochgeladen!', 'green');
        await fetchStudentsByCourse(selectedCourse.value);
        return;
      }

      showToast('Fehler beim Hochladen der CSV-Datei', 'red');
    };

    const updateQuizPeriod = async (quizId: string) => {
      if (!selectedCourse.value || !studentQuizPeriods.value[quizId]) {
        showToast('Bitte geben Sie einen Kurs und einen Bearbeitungszeitraum ein.', 'red');
        return;
      }

      try {
        const response = await quizApi.quizControllerUpdateEditableTill(
          selectedCourse.value,
          quizId,
          studentQuizPeriods.value[quizId]
        );

        if ([200, 201].includes(response.status)) {
          showToast('Bearbeitungszeitraum erfolgreich aktualisiert!', 'green');
          return;
        }

        showToast('Bei der Aktualisierung des Bearbeitungszeitraums ist etwas schief gelaufen.', 'red');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          showToast('Kein Quiz mit der angegebenen Quiz-ID vorhanden.', 'red');
        } else {
          showToast('Ein unerwarteter Fehler ist aufgetreten.', 'red');
        }
      }
    };

    const downloadQuizResults = async () => {
      if (!selectedCourse.value) {
        showToast('Bitte wählen Sie einen Kurs aus.', 'red');
        return;
      }

      try {
        const response = await courseApi.courseControllerGetStudentSolutionsAsZip(selectedCourse.value, {
          responseType: 'blob',
        });

        const zipUrl = useObjectUrl(new Blob([response.data]));

        if(!zipUrl['_value']) {
          showToast('Fehler beim Erzeugen des ZIP-Downloads', 'red');
          return;
        }

        const link = document.createElement('a');
        link.href = zipUrl['_value'];
        link.setAttribute('download', `${selectedCourse.value}-solutions.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Quiz-Ergebnisse erfolgreich heruntergeladen!', 'green');
      } catch (error: any) {
        showToast('Fehler beim Herunterladen der Quiz-Ergebnisse.', 'red');
      }
    };

    const formatDateTimeLocal = (dateTimeString: string): string => {
      const date = new Date(dateTimeString);
      return date.toISOString().slice(0, 16);
    };

    const showToast = (message: string, color: string) => {
      toast.value = {
        visible: true,
        message,
        color,
      };
    };

    onMounted(fetchCourses);

    return {
      courses,
      students,
      selectedCourse,
      newCourseName,
      csvFile,
      studentQuizPeriods,
      toast,
      selectCourse,
      createCourse,
      uploadCsv,
      updateQuizPeriod,
      downloadQuizResults,
      showToast,
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
