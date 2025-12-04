<script setup lang="ts">
  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
  import { useEventListener } from '@vueuse/core';
  import { computePosition, flip, offset, platform, shift } from '@floating-ui/dom';
  import { nextTick, reactive, ref, watch } from 'vue';

  type OpenArgs = {
    event: MouseEvent | KeyboardEvent;
    target?: HTMLElement | null;
  };

  const props = withDefaults(
    defineProps<{
      ariaLabel?: string;
      panelClass?: string;
      dataCy?: string;
      closeOnItemActivate?: boolean;
      closeOnOutsidePointer?: boolean;
      scrollStrategy?: 'close' | 'track-anchor' | 'fixed';
    }>(),
    {
      ariaLabel: 'Context menu',
      panelClass:
        'absolute min-w-[240px] max-w-xs space-y-2 rounded-xl border border-white/15 bg-surface-soft/95 p-3 text-sm text-slate-100 shadow-card',
      dataCy: 'context-menu',
      closeOnItemActivate: true,
      closeOnOutsidePointer: true,
      scrollStrategy: 'close',
    },
  );

  const emit = defineEmits<{ (e: 'open'): void; (e: 'close'): void }>();

  const isOpen = ref(false);
  const outsideEventsArmed = ref(false);
  const contextMenuPosition = reactive({ x: 0, y: 0 });
  const floatingStyles = reactive({ top: '0px', left: '0px' });

  const contextMenuAnchor = ref<HTMLDivElement | null>(null);
  const contextMenuButton = ref<HTMLButtonElement | null>(null);
  const contextMenuPanel = ref<HTMLElement | null>(null);
  const floatingReference = ref<HTMLElement | null>(null);
  const scrollPosition = reactive({ x: 0, y: 0 });

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
    if (!isOpen.value) return;
    isOpen.value = false;
    outsideEventsArmed.value = false;
    floatingReference.value = null;
    emit('close');
  };

  const handleItemActivate = () => {
    if (props.closeOnItemActivate) {
      closeMenu();
    }
  };

  const openMenu = async ({ event, target }: OpenArgs) => {
    const origin =
      event instanceof MouseEvent
        ? { x: event.clientX, y: event.clientY }
        : (() => {
            const rect = target?.getBoundingClientRect();
            if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          })();

    scrollPosition.x = window.scrollX;
    scrollPosition.y = window.scrollY;

    contextMenuPosition.x = origin.x;
    contextMenuPosition.y = origin.y;
    floatingStyles.left = `${origin.x}px`;
    floatingStyles.top = `${origin.y}px`;
    floatingReference.value = contextMenuAnchor.value;

    const wasOpen = isOpen.value;
    outsideEventsArmed.value = false;
    if (!wasOpen) {
      isOpen.value = true;
      emit('open');
      await nextTick();
      floatingReference.value = contextMenuAnchor.value;
      contextMenuButton.value?.click();
    }

    await nextTick();
    await updateFloatingPosition();
    outsideEventsArmed.value = true;
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
      if (!isOpen.value) return;

      const deltaX = window.scrollX - scrollPosition.x;
      const deltaY = window.scrollY - scrollPosition.y;

      scrollPosition.x = window.scrollX;
      scrollPosition.y = window.scrollY;

      if (props.scrollStrategy === 'close') {
        closeMenu();
        return;
      }

      if (props.scrollStrategy === 'track-anchor') {
        contextMenuPosition.x -= deltaX;
        contextMenuPosition.y -= deltaY;
        floatingStyles.left = `${contextMenuPosition.x}px`;
        floatingStyles.top = `${contextMenuPosition.y}px`;
        floatingReference.value = contextMenuAnchor.value;
        updateFloatingPosition();
      }
    },
    { passive: true },
  );

  const handleOutsidePointer = (event: Event) => {
    if (!isOpen.value || !props.closeOnOutsidePointer || !outsideEventsArmed.value) return;
    const target = event.target as Node | null;
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const isInsidePanel =
      contextMenuPanel.value instanceof HTMLElement &&
      (path.includes(contextMenuPanel.value) ||
        (target instanceof Node && contextMenuPanel.value.contains(target)));
    const isInsideButton =
      contextMenuButton.value instanceof HTMLElement &&
      (path.includes(contextMenuButton.value) ||
        (target instanceof Node && contextMenuButton.value.contains(target)));
    const targetElement = target instanceof HTMLElement ? target : null;
    const isWithinPanelAttribute = targetElement?.closest(`[data-cy="${props.dataCy}"]`);

    if (target && (isInsidePanel || isInsideButton || isWithinPanelAttribute)) {
      return;
    }
    closeMenu();
  };

  useEventListener(window, 'pointerdown', handleOutsidePointer, { capture: true });
  useEventListener(window, 'click', handleOutsidePointer, { capture: true });

  defineExpose({ openMenu, closeMenu });
</script>

<template>
  <Teleport to="body">
    <Menu
      v-if="isOpen"
      as="div"
      class="pointer-events-none fixed inset-0 z-50"
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
          {{ ariaLabel }}
        </button>
      </MenuButton>
      <MenuItems
        ref="contextMenuPanel"
        static
        as="div"
        class="pointer-events-auto"
        :class="panelClass"
        :style="floatingStyles"
        :aria-label="ariaLabel"
        :data-cy="dataCy"
        @click.stop
      >
        <slot
          :menu-item="MenuItem"
          :close="closeMenu"
          :close-item="handleItemActivate"
        />
      </MenuItems>
    </Menu>
  </Teleport>
</template>
