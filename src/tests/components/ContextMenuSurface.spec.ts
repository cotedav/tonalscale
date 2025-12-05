import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { beforeEach, vi } from 'vitest';

import ContextMenuSurface from '@/components/common/ContextMenuSurface.vue';
import { useContextMenu } from '@/composables/useContextMenu';

describe('ContextMenuSurface', () => {
  const { open, close } = useContextMenu();

  beforeEach(() => {
    close();
    vi.restoreAllMocks();
  });

  type SlotRenderer = (scope: { closeItem: () => void }) => ReturnType<typeof h>;

  const buildWrapper = (props?: Record<string, unknown>, slot?: SlotRenderer) => {
    const resolvedProps = props ?? {};
    const renderSlot =
      slot ??
      (({ closeItem }: { closeItem: () => void }) =>
        h(
          'button',
          {
            type: 'button',
            'data-test': 'menu-item',
            onClick: () => closeItem(),
          },
          'Item',
        ));

    return mount(ContextMenuSurface, {
      attachTo: document.body,
      props: resolvedProps,
      slots: {
        default: renderSlot,
      },
    });
  };

  const openMenu = async (coords = { x: 40, y: 50 }) => {
    open(new MouseEvent('contextmenu', { clientX: coords.x, clientY: coords.y }));
    await nextTick();
  };

  it('closes on menu item activate by default and can stay open when disabled', async () => {
    const wrapper = buildWrapper();
    await openMenu();

    const menuBefore = document.querySelector('[data-cy="context-menu"]');
    expect(menuBefore).not.toBeNull();

    const button = document.querySelector('[data-test="menu-item"]') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button?.click();
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();

    wrapper.unmount();

    const wrapperStayOpen = buildWrapper({ closeOnItemActivate: false });
    await openMenu({ x: 80, y: 90 });
    const persistentButton = document.querySelector(
      '[data-test="menu-item"]',
    ) as HTMLButtonElement | null;
    persistentButton?.click();
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).not.toBeNull();

    wrapperStayOpen.unmount();
  });

  it('closes on outside pointer and contextmenu by default and can remain open when disabled', async () => {
    const wrapper = buildWrapper();
    await openMenu();

    window.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();

    wrapper.unmount();

    await openMenu({ x: 60, y: 70 });
    window.dispatchEvent(new MouseEvent('contextmenu', { clientX: 10, clientY: 10 }));
    await nextTick();
    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();

    const wrapperAllow = buildWrapper({ closeOnOutside: false });
    await openMenu({ x: 120, y: 130 });
    window.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).not.toBeNull();

    wrapperAllow.unmount();
  });

  it('closes on scroll by default and can be configured to stay open', async () => {
    const closableWrapper = buildWrapper();
    await openMenu({ x: 160, y: 170 });

    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();

    closableWrapper.unmount();

    const persistentWrapper = buildWrapper({ closeOnScroll: false });
    await openMenu({ x: 200, y: 210 });

    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).not.toBeNull();

    closableWrapper.unmount();
    persistentWrapper.unmount();
  });
});
