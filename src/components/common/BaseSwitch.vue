<script setup lang="ts">
  defineProps<{
    id: string;
    label: string;
    modelValue: boolean;
    dataCy?: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
  }>();

  const handleChange = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).checked);
  };
</script>

<template>
  <label
    class="base-switch"
    :for="id"
  >
    <slot name="before" />
    <span
      v-if="$slots.default"
      class="base-switch-label"
    >
      <slot />
    </span>
    <input
      :id="id"
      type="checkbox"
      class="peer sr-only"
      :checked="modelValue"
      :aria-label="label"
      :data-cy="dataCy"
      @change="handleChange"
    />
    <span
      class="base-switch-track"
      aria-hidden="true"
    >
      <span class="base-switch-thumb" />
    </span>
    <slot name="after" />
  </label>
</template>

<style scoped>
  .base-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgb(var(--color-text-primary));
    cursor: pointer;
  }

  .base-switch-label {
    font-size: 14px;
    font-weight: 600;
  }

  .base-switch-track {
    position: relative;
    width: 44px;
    height: 24px;
    flex: 0 0 auto;
    border: 1px solid rgb(var(--color-border-highlight));
    border-radius: 999px;
    background: rgb(var(--color-surface-strong));
    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .base-switch-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgb(var(--color-text-secondary));
    box-shadow: 0 1px 3px rgb(0 0 0 / 25%);
    transition:
      background-color 160ms ease,
      transform 160ms ease;
  }

  .peer:checked + .base-switch-track {
    border-color: rgb(var(--color-accent-strong));
    background: rgb(var(--color-accent-strong));
  }

  .peer:checked + .base-switch-track .base-switch-thumb {
    background: white;
    transform: translateX(20px);
  }

  .peer:focus-visible + .base-switch-track {
    outline: 2px solid rgb(var(--color-accent));
    outline-offset: 2px;
  }
</style>
