import { createRouter, createWebHistory } from 'vue-router';
// @ts-ignore
import CreateQuiz from "../components/CreateQuiz.vue";
// @ts-ignore
import SolveQuiz from "../components/SolveQuiz.vue";
// @ts-ignore
import Admin from "../components/Admin.vue";
// @ts-ignore
import Login from "../components/Login.vue";

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
  { path: '/login', component: Login },
  {
    path: '/admin',
    component: Admin,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    component: Admin,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('userLoggedIn') === 'true';
  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
