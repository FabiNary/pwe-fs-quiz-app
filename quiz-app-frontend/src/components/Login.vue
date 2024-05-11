<template>
  <v-container>
    <v-form @submit.prevent="submitLogin">
      <v-text-field v-model="username" label="Username" required></v-text-field>
      <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
      <v-btn type="submit" color="primary">Login</v-btn>
    </v-form>
  </v-container>
  <v-snackbar v-model="toast.visible" :color="toast.color" top>
    {{ toast.message }}
    <v-btn color="white" @click="toast.visible = false">Schließen</v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import {OpenAPIDefaultConfig} from "../utils/openAPIDefaultConfig";
import {AuthApi} from "../app";
import {defineComponent, ref} from "vue";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Login',
  setup() {
    const username = ref<string>('');
    const password = ref<string>('');
    const toast = ref({
      visible: false,
      message: '',
      color: '',
    });
    const router = useRouter();
    const submitLogin = async () => {
      try {
        const authApi = new AuthApi(OpenAPIDefaultConfig);

        const response = await authApi.authControllerLogin({
          username: username.value,
          password: password.value
        });

        if ([200, 201].includes(response.status)) {
          localStorage.setItem('userLoggedIn', 'true');
          await router.push('/admin');
          return;
        }
        showToast('Fehler beim einloggen', 'red')

      } catch (error) {
        showToast('Fehler beim einloggen', 'red')
      }
    }

    const showToast = (message: string, color: string) => {
      toast.value = {
        visible: true,
        message,
        color,
      };
    };

    return {
      username,
      password,
      toast,
      submitLogin
    }
  }});
</script>
