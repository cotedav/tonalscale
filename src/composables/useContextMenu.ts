import { ref } from 'vue';

export const CUSTOM_CONTEXT_ATTR = 'data-custom-contextmenu';

export type ContextMenuPayload = unknown | null;

export type ContextMenuState = {
  x: number;
  y: number;
  payload: ContextMenuPayload;
  target: HTMLElement | null;
};

const isOpen = ref(false);
const state = ref<ContextMenuState | null>(null);

export function useContextMenu() {
  const open = (
    event: MouseEvent | KeyboardEvent,
    target: HTMLElement | null = (event.currentTarget as HTMLElement | null) ?? null,
    payload: ContextMenuPayload = null,
  ) => {
    event.preventDefault();

    const origin =
      event instanceof MouseEvent
        ? { x: event.clientX, y: event.clientY }
        : (() => {
            const rect = target?.getBoundingClientRect();
            if (!rect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          })();

    state.value = {
      x: origin.x,
      y: origin.y,
      payload,
      target,
    };
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    state.value = null;
  };

  return { isOpen, state, open, close } as const;
}

export function useContextMenuState() {
  return { isOpen, state } as const;
}
