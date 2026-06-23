<script setup lang="ts">
  import { Toaster } from 'vue-sonner';
  import ContextMenu from '@/components/common/ContextMenu.vue';

  // Import styles
  import 'vue-sonner/style.css';
</script>

<template>
  <!-- Background colors are handled by body styles in main.css -->
  <div class="min-h-screen">
    <!-- Toaster must be outside potential transform containers to perform fixed positioning correctly -->
    <Toaster
      position="bottom-right"
      theme="system"
      :rich-colors="true"
    />
    <ContextMenu />

    <router-view />
  </div>
</template>
