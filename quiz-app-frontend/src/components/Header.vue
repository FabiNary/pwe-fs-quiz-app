<template>
  <v-app-bar app dense>
    <!-- Links: Icon und Titel -->
    <v-toolbar-title>
      <v-icon>mdi-school</v-icon>
      Quiz App
    </v-toolbar-title>

    <!-- Spacer -->
    <v-spacer></v-spacer>

    <!-- Rechts: Admin Button -->
    <v-btn
      to="/admin"
      class="app-bar-button"
    >
      <v-icon right>mdi-account-cog-outline</v-icon>
      Admin
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: 'Header',
};
</script>

<style>
.v-app-bar {
  background-color: #6200ee;
  color: white;
}

.app-bar-button {
  color: white;
  margin-left: 8px;
  margin-right: 8px;
}
</style>
