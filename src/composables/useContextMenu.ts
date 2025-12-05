import { nextTick, reactive, toRefs } from 'vue';
import type { TonalStep } from '@/utils/tonal/scale';

export interface ContextMenuContext {
  token: 'tone' | 'strip';
  tone?: TonalStep;
  darker3?: { index: number; hex: string } | null;
  darker45?: { index: number; hex: string } | null;
  lighter3?: { index: number; hex: string } | null;
  lighter45?: { index: number; hex: string } | null;
  onScroll?: (event: WheelEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

const state = reactive({
  isOpen: false,
  position: { x: 0, y: 0 },
  contextData: null as ContextMenuContext | null,
});

export const useContextMenu = () => {
  const open = async (event: MouseEvent, data?: ContextMenuContext) => {
    event.preventDefault();
    if (state.isOpen) {
      state.isOpen = false;
      await nextTick();
    }
    state.isOpen = true;
    state.position = { x: event.clientX, y: event.clientY };
    if (data) {
      state.contextData = data;
    }
  };

  const close = () => {
    state.isOpen = false;
    state.contextData = null;
  };

  return {
    ...toRefs(state),
    open,
    close,
  };
};
