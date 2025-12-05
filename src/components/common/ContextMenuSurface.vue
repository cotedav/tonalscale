<script setup lang="ts">
  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
  import { useEventListener } from '@vueuse/core';
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';

  import { CUSTOM_CONTEXT_ATTR, useContextMenu } from '@/composables/useContextMenu';

  type VirtualElement = {
    getBoundingClientRect: () => DOMRect;
  };

  const props = withDefaults(
    defineProps<{
      ariaLabel?: string;
      panelClass?: string;
      dataCy?: string;
      closeOnItemActivate?: boolean;
      closeOnOutside?: boolean;
      closeOnScroll?: boolean;
    }>(),
    {
      ariaLabel: 'Context menu',
      panelClass:
        'absolute min-w-[240px] max-w-xs space-y-2 rounded-xl border border-white/15 bg-surface-soft/95 p-3 text-sm text-slate-100 shadow-card',
      dataCy: 'context-menu',
      closeOnItemActivate: true,
      closeOnOutside: true,
      closeOnScroll: true,
    },
  );

  const emit = defineEmits<{ (e: 'open'): void; (e: 'close'): void }>();

  const { isOpen, state, close } = useContextMenu();

  const menuPanel = ref<HTMLElement | null>(null);
  const menuButton = ref<HTMLButtonElement | null>(null);

  const panelEl = computed<HTMLElement | null>(() => {
    const panel = menuPanel.value as unknown;
    if (panel instanceof HTMLElement) return panel;
    if (panel && typeof (panel as { $el?: unknown }).$el !== 'undefined') {
      const el = (panel as { $el?: unknown }).$el;
      return el instanceof HTMLElement ? el : null;
    }
    return null;
  });

  const virtualReference = computed<VirtualElement | null>(() => {
    if (!state.value) return null;
    const { x, y } = state.value;
    return {
      getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
    };
  });

  const floatingStyles = ref<{ left: string; top: string }>({ left: '0px', top: '0px' });

  const setFallbackPosition = () => {
    if (!state.value) return;
    floatingStyles.value = { left: `${state.value.x}px`, top: `${state.value.y}px` };
  };

  const updatePosition = async () => {
    setFallbackPosition();
    if (!virtualReference.value || !(panelEl.value instanceof HTMLElement)) return;

    const { x, y } = await computePosition(virtualReference.value, panelEl.value, {
      placement: 'bottom-start',
      middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    });

    floatingStyles.value = { left: `${x}px`, top: `${y}px` };
  };

  const handleItemActivate = () => {
    if (props.closeOnItemActivate) {
      close();
    }
  };

  const handleOutsidePointer = (event: PointerEvent) => {
    if (!props.closeOnOutside || !isOpen.value) return;

    const target = event.target as HTMLElement | null;
    const targetNode = target instanceof Node ? target : null;
    if (panelEl.value && targetNode && panelEl.value.contains(targetNode)) return;

    close();
  };

  const handleGlobalContextMenu = (event: MouseEvent) => {
    if (!isOpen.value || !props.closeOnOutside) return;
    const target = event.target as HTMLElement | null;
    const isCustomTarget = target?.closest(`[${CUSTOM_CONTEXT_ATTR}="true"]`);
    if (!isCustomTarget) {
      close();
    }
  };

  watch(
    () => isOpen.value,
    async (open) => {
      if (open) {
        emit('open');
        await nextTick();
        if (menuButton.value) {
          menuButton.value.click();
        }
        await updatePosition();
      } else {
        emit('close');
      }
    },
  );

  watch(state, async (next) => {
    if (!next || !isOpen.value) return;
    await nextTick();
    await updatePosition();
  });

  useEventListener(window, 'keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Escape') {
      close();
    }
  });

  const handleScroll = () => {
    if (!props.closeOnScroll || !isOpen.value) return;
    close();
  };

  const detachOutsideListeners: Array<() => void> = [];

  onMounted(() => {
    const pointerHandler = (event: PointerEvent) => handleOutsidePointer(event);
    const contextHandler = (event: MouseEvent) => handleGlobalContextMenu(event);
    const scrollHandler = () => handleScroll();

    window.addEventListener('pointerdown', pointerHandler, true);
    window.addEventListener('contextmenu', contextHandler, true);
    window.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
    document.addEventListener('scroll', scrollHandler, { passive: true, capture: true });

    detachOutsideListeners.push(() =>
      window.removeEventListener('pointerdown', pointerHandler, true),
    );
    detachOutsideListeners.push(() =>
      window.removeEventListener('contextmenu', contextHandler, true),
    );
    detachOutsideListeners.push(() =>
      window.removeEventListener('scroll', scrollHandler, { capture: true }),
    );
    detachOutsideListeners.push(() =>
      document.removeEventListener('scroll', scrollHandler, { capture: true }),
    );
  });

  onBeforeUnmount(() => {
    close();
    detachOutsideListeners.splice(0).forEach((detach) => detach());
  });
</script>

<template>
  <Teleport to="body">
    <Menu
      v-if="isOpen && state"
      as="div"
      class="fixed z-50"
      :style="{ left: `${state.x}px`, top: `${state.y}px` }"
    >
      <MenuButton as="template">
        <button
          ref="menuButton"
          type="button"
          class="sr-only"
          :aria-label="ariaLabel"
        >
          {{ ariaLabel }}
        </button>
      </MenuButton>
      <MenuItems
        ref="menuPanel"
        static
        as="div"
        class="pointer-events-auto"
        :class="panelClass"
        :style="floatingStyles"
        :aria-label="ariaLabel"
        :data-cy="dataCy"
      >
        <slot
          :menu-item="MenuItem"
          :close="close"
          :close-item="handleItemActivate"
        />
      </MenuItems>
    </Menu>
  </Teleport>
</template>
