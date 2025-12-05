<script setup lang="ts">
  import { Toaster } from 'vue-sonner';
  import ContextMenu from '@/components/common/ContextMenu.vue';

  // Import styles
  import 'vue-sonner/style.css';
</script>

<template>
  <div class="min-h-screen bg-surface-strong text-slate-100">
    <!-- Toaster must be outside potential transform containers to perform fixed positioning correctly -->
    <Toaster
      position="bottom-right"
      theme="dark"
      :rich-colors="true"
    />
    <ContextMenu />
    <main class="mx-auto flex min-h-screen w-full max-w-screen-xl px-6 py-10">
      <div class="w-full">
        <router-view />
      </div>
    </main>
  </div>
</template>
