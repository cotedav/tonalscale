<script setup lang="ts">
  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
  import { useEventListener } from '@vueuse/core';
  import { computePosition, flip, offset, platform, shift } from '@floating-ui/dom';
  import { nextTick, reactive, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

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
  }>();

  const { t } = useI18n();

  const emit = defineEmits<{
    (e: 'select', tone: TonalStep | null): void;
    (e: 'open'): void;
    (e: 'close'): void;
  }>();

  const isOpen = ref(false);
  const contextMenuPosition = reactive({ x: 0, y: 0 });
  const floatingStyles = reactive({ top: '0px', left: '0px' });

  const contextMenuAnchor = ref<HTMLDivElement | null>(null);
  const contextMenuButton = ref<HTMLButtonElement | null>(null);
  const contextMenuPanel = ref<HTMLElement | null>(null);
  const floatingReference = ref<HTMLElement | null>(null);

  const updateFloatingPosition = async () => {
    if (
      !(floatingReference.value instanceof HTMLElement) ||
      !(contextMenuPanel.value instanceof HTMLElement)
    ) {
      floatingStyles.left = `${contextMenuPosition.x}px`;
      floatingStyles.top = `${contextMenuPosition.y}px`;
      return;
    }

    const { x, y } = await computePosition(floatingReference.value, contextMenuPanel.value, {
      placement: 'bottom-start',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
      platform: { ...platform, isRTL: () => false },
    });

    floatingStyles.left = `${x}px`;
    floatingStyles.top = `${y}px`;
  };

  const closeMenu = () => {
    isOpen.value = false;
    floatingReference.value = null;
    emit('close');
  };

  const openMenu = async ({
    event,
    target,
  }: {
    event: MouseEvent | KeyboardEvent;
    target?: HTMLElement | null;
  }) => {
    const origin =
      event instanceof MouseEvent
        ? { x: event.clientX, y: event.clientY }
        : (() => {
            const rect = target?.getBoundingClientRect();
            if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          })();

    contextMenuPosition.x = origin.x;
    contextMenuPosition.y = origin.y;
    floatingStyles.left = `${origin.x}px`;
    floatingStyles.top = `${origin.y}px`;
    floatingReference.value = contextMenuAnchor.value;

    isOpen.value = true;
    emit('open');

    await nextTick();
    floatingReference.value = contextMenuAnchor.value;
    contextMenuButton.value?.click();
    await nextTick();
    await updateFloatingPosition();
  };

  watch(
    () => isOpen.value,
    async (open) => {
      if (!open) return;

      await nextTick();
      floatingReference.value = contextMenuAnchor.value;
      await updateFloatingPosition();
    },
  );

  useEventListener(window, 'keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Escape') {
      closeMenu();
    }
  });

  useEventListener(
    window,
    'scroll',
    () => {
      if (isOpen.value) {
        closeMenu();
      }
    },
    { passive: true },
  );

  defineExpose({ openMenu, closeMenu });
</script>

<template>
  <Teleport to="body">
    <Menu
      v-if="isOpen"
      v-slot="{ close }"
      as="div"
      class="fixed inset-0 z-50"
      @click.self="closeMenu"
    >
      <div
        ref="contextMenuAnchor"
        class="pointer-events-none fixed h-1 w-1"
        :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
        aria-hidden="true"
      />
      <MenuButton as="template">
        <button
          ref="contextMenuButton"
          type="button"
          class="sr-only"
          data-cy="context-menu-button"
        >
          {{ title }}
        </button>
      </MenuButton>
      <MenuItems
        ref="contextMenuPanel"
        static
        as="div"
        class="absolute min-w-[240px] max-w-xs space-y-2 rounded-xl border border-white/15 bg-surface-soft/95 p-3 text-sm text-slate-100 shadow-card"
        :style="floatingStyles"
        aria-label="Context menu"
        data-cy="context-menu"
        @click.stop
      >
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {{ title }}
        </p>
        <MenuItem
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
              close();
              closeMenu();
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
        </MenuItem>
        <p class="text-[11px] text-slate-500">
          {{ helperText }}
        </p>
      </MenuItems>
    </Menu>
  </Teleport>
</template>
