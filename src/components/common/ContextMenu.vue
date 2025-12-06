<script setup lang="ts">
  import { computed, ref, watch, type Component } from 'vue';
  import { useFloating, flip, shift, autoUpdate } from '@floating-ui/vue';
  import { onClickOutside, useEventListener } from '@vueuse/core';
  import { useContextMenu } from '@/composables/useContextMenu';
  import { useClipboard } from '@/composables/useClipboard';

  const { isOpen, position, contextData, close } = useContextMenu();
  const { copyToClipboard } = useClipboard();

  const reference = computed(() => ({
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: position.value.x,
        y: position.value.y,
        top: position.value.y,
        left: position.value.x,
        right: position.value.x,
        bottom: position.value.y,
      };
    },
  }));

  const floating = ref<HTMLElement | null>(null);
  const { floatingStyles } = useFloating(reference, floating, {
    placement: 'bottom-start',
    middleware: [flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  onClickOutside(floating, close);

  // Close on Escape
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      close();
    }
  };

  watch(isOpen, (val) => {
    if (val) {
      window.addEventListener('keydown', onKeydown);
    } else {
      window.removeEventListener('keydown', onKeydown);
    }
  });

  const handleCopyHex = async (hex: string, label: string) => {
    if (hex) {
      await copyToClipboard(hex, label);
    }
    close();
  };

  interface MenuItem {
    label: string;
    action: () => void;
    icon?: Component;
    sub?: string;
    hex?: string;
    highlight?: boolean;
  }

  // Close on outside scroll
  useEventListener(window, 'wheel', () => {
    if (isOpen.value) {
      close();
    }
  });

  const menuItems = computed<MenuItem[]>(() => {
    if (!contextData.value) return [];
    const items: MenuItem[] = [];

    if (contextData.value.token === 'tone') {
      // Darker Neighbors
      if (contextData.value.darker45) {
        items.push({
          label: 'Darker AAA (4.5:1)',
          sub: `Index: ${contextData.value.darker45.index} Hex: ${contextData.value.darker45.hex}`,
          hex: contextData.value.darker45.hex,
          action: () => handleCopyHex(contextData.value!.darker45!.hex, 'Darker AAA'),
        });
      }
      if (contextData.value.darker3) {
        items.push({
          label: 'Darker AA (3:1)',
          sub: `Index: ${contextData.value.darker3.index} Hex: ${contextData.value.darker3.hex}`,
          hex: contextData.value.darker3.hex,
          action: () => handleCopyHex(contextData.value!.darker3!.hex, 'Darker AA'),
        });
      }

      // Current Color
      if (contextData.value.tone) {
        items.push({
          label: 'Color',
          sub: `Index: ${contextData.value.tone.index} Hex: ${contextData.value.tone.hex}`,
          hex: contextData.value.tone.hex,
          action: () => handleCopyHex(contextData.value!.tone!.hex, 'Hex'),
          highlight: true,
        });
      }

      // Lighter Neighbors
      if (contextData.value.lighter3) {
        items.push({
          label: 'Lighter AA (3:1)',
          sub: `Index: ${contextData.value.lighter3.index} Hex: ${contextData.value.lighter3.hex}`,
          hex: contextData.value.lighter3.hex,
          action: () => handleCopyHex(contextData.value!.lighter3!.hex, 'Lighter AA'),
        });
      }
      if (contextData.value.lighter45) {
        items.push({
          label: 'Lighter AAA (4.5:1)',
          sub: `Index: ${contextData.value.lighter45.index} Hex: ${contextData.value.lighter45.hex}`,
          hex: contextData.value.lighter45.hex,
          action: () => handleCopyHex(contextData.value!.lighter45!.hex, 'Lighter AAA'),
        });
      }
    }

    return items;
  });
</script>

<template>
  <div
    v-if="isOpen"
    ref="floating"
    :style="floatingStyles"
    class="fixed z-50 min-w-[240px]"
    @wheel.stop.prevent="contextData?.onScroll?.($event)"
  >
    <div
      class="flex flex-col rounded-xl border border-glass/15 bg-surface-soft/90 p-1 shadow-card backdrop-blur-xl"
    >
      <button
        v-for="(item, idx) in menuItems"
        :key="idx"
        class="flex w-full flex-col gap-1 rounded px-3 py-2 text-left hover:bg-glass/5"
        :class="item.highlight ? 'bg-glass/5 border border-dim' : ''"
        @click="item.action"
      >
        <div class="flex items-center gap-2">
          <component
            :is="item.icon"
            v-if="item.icon"
            class="h-4 w-4 text-tertiary"
          />
          <span class="text-sm font-medium text-primary">{{ item.label }}</span>
        </div>
        <div
          v-if="item.sub"
          class="text-xs font-mono text-tertiary"
        >
          {{ item.sub }}
        </div>
      </button>
    </div>
  </div>
</template>
