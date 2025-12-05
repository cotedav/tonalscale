import type { DirectiveBinding, ObjectDirective } from 'vue';

import { CUSTOM_CONTEXT_ATTR, useContextMenu } from '@/composables/useContextMenu';

const handlers = new WeakMap<HTMLElement, (event: MouseEvent) => void>();

const contextMenuDirective: ObjectDirective<HTMLElement, (event: MouseEvent) => unknown> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<(event: MouseEvent) => unknown>) {
    el.setAttribute(CUSTOM_CONTEXT_ATTR, 'true');

    const { open } = useContextMenu();

    const handler = (event: MouseEvent) => {
      const payload = typeof binding.value === 'function' ? binding.value(event) : null;
      open(event, el, payload);
    };

    handlers.set(el, handler);
    el.addEventListener('contextmenu', handler);
  },
  unmounted(el: HTMLElement) {
    const handler = handlers.get(el);
    if (handler) {
      el.removeEventListener('contextmenu', handler);
      handlers.delete(el);
    }
    el.removeAttribute(CUSTOM_CONTEXT_ATTR);
  },
};

export const vContextMenu = contextMenuDirective;
export default contextMenuDirective;
