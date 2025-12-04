import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { vi } from 'vitest';

import ContextMenuSurface from '@/components/common/ContextMenuSurface.vue';

describe('ContextMenuSurface', () => {
  afterEach(() => {
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

  const openMenu = async (wrapper: ReturnType<typeof buildWrapper>, coords = { x: 40, y: 50 }) => {
    const api = wrapper.vm as unknown as {
      openMenu: (args: { event: MouseEvent }) => Promise<void>;
      closeMenu: () => void;
    };

    await api.openMenu({
      event: new MouseEvent('contextmenu', { clientX: coords.x, clientY: coords.y }),
    });
    await nextTick();
  };

  it('closes on menu item activate by default and can stay open when disabled', async () => {
    const wrapper = buildWrapper();
    await openMenu(wrapper);

    const menuBefore = document.querySelector('[data-cy="context-menu"]');
    expect(menuBefore).not.toBeNull();

    const button = document.querySelector('[data-test="menu-item"]') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button?.click();
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();

    const wrapperStayOpen = buildWrapper({ closeOnItemActivate: false });
    await openMenu(wrapperStayOpen, { x: 80, y: 90 });
    const persistentButton = document.querySelector(
      '[data-test="menu-item"]',
    ) as HTMLButtonElement | null;
    persistentButton?.click();
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).not.toBeNull();

    wrapper.unmount();
    wrapperStayOpen.unmount();
  });

  it('closes on outside pointer by default and can remain open when disabled', async () => {
    const wrapper = buildWrapper();
    await openMenu(wrapper);

    window.dispatchEvent(new MouseEvent('pointerdown', { button: 2 }));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();

    const blocker = document.createElement('div');
    blocker.id = 'stopper';
    blocker.addEventListener('pointerdown', (event) => event.stopPropagation());
    document.body.appendChild(blocker);

    await openMenu(wrapper, { x: 180, y: 190 });
    blocker.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).toBeNull();
    blocker.remove();

    const wrapperAllow = buildWrapper({ closeOnOutsidePointer: false });
    await openMenu(wrapperAllow, { x: 120, y: 130 });

    window.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).not.toBeNull();

    wrapper.unmount();
    wrapperAllow.unmount();
  });

  it('respects scroll strategies', async () => {
    let scrollX = 0;
    let scrollY = 0;

    vi.spyOn(window, 'scrollX', 'get').mockImplementation(() => scrollX);
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);

    const fixedWrapper = buildWrapper({ scrollStrategy: 'fixed' });
    await openMenu(fixedWrapper, { x: 160, y: 170 });

    scrollY = 50;
    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(document.querySelector('[data-cy="context-menu"]')).not.toBeNull();

    fixedWrapper.unmount();

    const trackingWrapper = buildWrapper({ scrollStrategy: 'track-anchor' });
    await openMenu(trackingWrapper, { x: 200, y: 210 });

    const menuBefore = document.querySelector('[data-cy="context-menu"]') as HTMLElement | null;
    const initialTop = Number.parseFloat(menuBefore?.style.top ?? '0');

    scrollY = 110;
    scrollX = 25;
    window.dispatchEvent(new Event('scroll'));
    await nextTick();

    const menuAfter = document.querySelector('[data-cy="context-menu"]') as HTMLElement | null;
    const afterTop = Number.parseFloat(menuAfter?.style.top ?? '0');

    expect(menuAfter).not.toBeNull();
    expect(afterTop).not.toBe(initialTop);

    trackingWrapper.unmount();
  });
});
