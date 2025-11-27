<script setup lang="ts">
  const title = 'Page not found';
  const message =
    'The page you are looking for does not exist yet. Use the navigation to continue exploring the portal.';
</script>

<template>
  <section
    class="text-center d-flex flex-column align-center gap-4"
    data-cy="not-found"
  >
    <v-icon
      icon="mdi-compass-off"
      size="72"
      color="error"
    />
    <div>
      <h1 class="text-h5 font-weight-bold mb-2">{{ title }}</h1>
      <p class="text-body-2 text-medium-emphasis">{{ message }}</p>
    </div>
    <v-btn
      color="primary"
      variant="flat"
      to="/"
      data-cy="not-found-home-link"
    >
      Return home
    </v-btn>
  </section>
</template>
