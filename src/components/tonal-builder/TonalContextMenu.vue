<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { computed, ref } from 'vue';

  import ContextMenuSurface from '@/components/common/ContextMenuSurface.vue';
  import type { TonalStep } from '@/utils/tonal/scale';

  type ContextMenuAction = {
    key: string;
    label: string;
    tone: TonalStep | null;
  };

  const props = defineProps<{
    title: string;
    helperText: string;
    actions: ContextMenuAction[];
    closeOnAction?: boolean;
    closeOnOutside?: boolean;
    scrollStrategy?: 'close' | 'track-anchor' | 'fixed';
  }>();

  const { t } = useI18n();

  const emit = defineEmits<{
    (e: 'select', tone: TonalStep | null): void;
    (e: 'open'): void;
    (e: 'close'): void;
  }>();

  const contextMenu = ref<InstanceType<typeof ContextMenuSurface> | null>(null);

  const anyEnabled = computed(() => props.actions.some((action) => !!action.tone));

  const openMenu = (payload: {
    event: MouseEvent | KeyboardEvent;
    target?: HTMLElement | null;
  }) => {
    contextMenu.value?.openMenu(payload);
  };

  const closeMenu = () => {
    contextMenu.value?.closeMenu();
  };

  defineExpose({ openMenu, closeMenu });
</script>

<template>
  <ContextMenuSurface
    ref="contextMenu"
    :aria-label="title"
    data-cy="context-menu"
    :close-on-item-activate="props.closeOnAction ?? true"
    :close-on-outside-pointer="props.closeOnOutside ?? true"
    :scroll-strategy="props.scrollStrategy ?? 'close'"
    @open="emit('open')"
    @close="emit('close')"
  >
    <template #default="{ menuItem, closeItem }">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {{ title }}
      </p>
      <component
        :is="menuItem"
        v-for="action in props.actions"
        :key="action.key"
        v-slot="{ active, disabled }"
        :disabled="!action.tone"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          :class="[
            'border-white/10',
            disabled ? 'opacity-40' : 'hover:border-accent/60 hover:bg-accent/10',
            active && !disabled ? 'border-accent/60 bg-accent/10' : '',
          ]"
          :disabled="disabled"
          @click="
            emit('select', action.tone ?? null);
            closeItem();
          "
        >
          <span class="text-xs font-semibold">{{ action.label }}</span>
          <span
            v-if="action.tone"
            class="text-[11px] font-mono text-slate-300"
          >
            #{{ action.tone.index }} — {{ action.tone.hex }}
          </span>
          <span
            v-else
            class="text-[11px] text-slate-500"
          >
            {{ t('tonal_builder.clipboard.unavailable') }}
          </span>
        </button>
      </component>
      <p class="text-[11px] text-slate-500">
        {{ helperText }}
      </p>
      <p
        v-if="!anyEnabled"
        class="sr-only"
        role="status"
      >
        {{ t('tonal_builder.clipboard.missing_selection') }}
      </p>
    </template>
  </ContextMenuSurface>
</template>
