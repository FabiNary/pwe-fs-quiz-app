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
              <v-list-item-group  v-model="selectedCourse">
                <v-list-item
                  v-for="course in courses"
                  :key="course"
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
                      @focus="loadStudentQuizPeriod(student.quizCreationId)"
                    ></v-text-field>
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn @click="updateQuizPeriod(student.id)" color="primary">Aktualisieren</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list-item-group>
            </v-list>
            <v-divider class="my-4"></v-divider>
            <v-btn @click="downloadQuizResults" color="primary">Quizergebnisse herunterladen</v-btn>
          </v-col>
        </v-row>

        <v-snackbar v-model="toast.visible" :color="toast.color" top>
          {{ toast.message }}
          <v-btn color="white" text @click="toast.visible = false">Schließen</v-btn>
        </v-snackbar>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {OpenAPIDefaultConfig} from "../utils/openAPIDefaultConfig";
import {CoursesApi, StudentApi, StudentDto} from "../app";

export default defineComponent({
  name: 'Admin',
  setup() {
    const courses = ref<string[]>(['Platzhalter Kurs 1', 'Platzhalter Kurs 2']);
    const students = ref<StudentDto[]>([]);
    const selectedCourse = ref<string | null>(null);
    const newCourseName = ref<string>('');
    const csvFile = ref<File | null>(null);
    const studentQuizPeriods = ref<{ [key: string]: string }>({
      '1': '2024-05-20T14:00',
      '2': '2024-05-21T16:00',
    });
    const toast = ref({
      visible: false,
      message: '',
      color: '',
    });
    const courseApi = new CoursesApi(OpenAPIDefaultConfig);
    const studentApi = new StudentApi(OpenAPIDefaultConfig);

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

      if([200, 201].includes(response.status)) {
        students.value = response.data;
        return;
      }

      showToast('Es ist ein Fehler aufgetreten', 'red');

      initializeStudentQuizPeriods();
    };

    const initializeStudentQuizPeriods = () => {
      studentQuizPeriods.value = {};
      for (const student of students.value) {
        studentQuizPeriods.value[student.id] = '';
      }
    };

    const createCourse = async () => {
      if (newCourseName.value !== '' && !newCourseName.value) {
        showToast('Bitte geben Sie einen Kursnamen ein.', 'red');
        return;
      }

      const response = await courseApi.courseControllerAddCourse(newCourseName.value);

      if([200, 201].includes(response.status)) {
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

      const response = await studentApi.studentControllerAddStudentsAsCsv(selectedCourse.value, csvFile.value)

      if([200, 201].includes(response.status)) {
        showToast('CSV erfolgreich hochgeladen!', 'green');
        fetchStudentsByCourse(selectedCourse.value).then(r => r)
        return;
      }

      showToast('Fehler beim hochladen der CSV-Datei', 'red');
    };

    const updateQuizPeriod = async (studentId: string) => {
      if (!selectedCourse.value || !studentQuizPeriods.value[studentId]) {
        showToast('Bitte geben Sie einen Kurs und einen Bearbeitungszeitraum ein.', 'red');
        return;
      }

      // Platzhalter für die API-Kommunikation
      showToast('Bearbeitungszeitraum erfolgreich aktualisiert!', 'green');
    };

    const downloadQuizResults = async () => {
      if (!selectedCourse.value) {
        showToast('Bitte wählen Sie einen Kurs aus.', 'red');
        return;
      }

      // Platzhalter für die API-Kommunikation
      showToast('Quizergebnisse erfolgreich heruntergeladen!', 'green');
    };

    const loadStudentQuizPeriod = async (quizId: string): Promise<string> => {
      if (!selectedCourse.value) {
        showToast('Bitte wählen Sie einen Kurs aus.', 'red');
        return;
      }

      try {
        // Platzhalter für die API-Funktionalität
        // Ersetzen Sie diesen Teil durch einen tatsächlichen API-Aufruf
        const response = {
          data: '2024-05-20T14:00', // Beispielwert
        };

        if (response.data) {
          studentQuizPeriods.value[quizId] = response.data;
        } else {
          showToast('Kein Bearbeitungszeitraum gefunden.', 'red');
        }
      } catch (error) {
        showToast('Fehler beim Abrufen des Bearbeitungszeitraums.', 'red');
      }
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
      loadStudentQuizPeriod,
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
