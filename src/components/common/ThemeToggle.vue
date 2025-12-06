<script setup lang="ts">
  import { MoonIcon, SunIcon } from '@heroicons/vue/24/solid';
  import { isDark, toggleTheme } from '@/composables/useTheme';
</script>

<template>
  <button
    type="button"
    class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-accent transition-colors hover:bg-surface-strong hover:text-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface dark:bg-surface-soft dark:text-accent-soft dark:hover:bg-surface dark:hover:text-accent"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggleTheme()"
  >
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-75 rotate-45"
      enter-to-class="opacity-100 scale-100 rotate-0"
      leave-active-class="transition duration-200 ease-in absolute"
      leave-from-class="opacity-100 scale-100 rotate-0"
      leave-to-class="opacity-0 scale-75 -rotate-45"
    >
      <SunIcon
        v-if="!isDark"
        class="h-5 w-5"
      />
      <MoonIcon
        v-else
        class="h-5 w-5"
      />
    </transition>
  </button>
</template>
