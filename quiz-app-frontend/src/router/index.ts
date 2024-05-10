import { createRouter, createWebHistory } from 'vue-router';
// @ts-ignore
import CreateQuiz from "../components/CreateQuiz.vue";
// @ts-ignore
import SolveQuiz from "../components/SolveQuiz.vue";
// @ts-ignore
import Admin from "../components/Admin.vue";

const routes = [
  {
    path: '/create-quiz',
    name: 'CreateQuiz',
    component: CreateQuiz,
  },
  {
    path: '/quiz',
    name: 'SolveQuiz',
    component: SolveQuiz,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
