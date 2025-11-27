<script setup lang="ts">
  // Placeholder layout shell for future navigation, toolbars, and shared UI regions.
</script>

<template>
  <v-app>
    <v-main>
      <v-container
        class="py-8"
        data-cy="app-shell"
      >
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
