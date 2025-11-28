import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ColorPickerCard from '@/components/tonal-builder/ColorPickerCard.vue';
import { hexToHsv, hexToRgb, normalizeHex, type HsvColor, type RgbColor } from '@/utils/color';

type MockColorShape = {
  hexString: string;
  rgb: RgbColor;
  hsv: HsvColor;
  set: (color: string) => void;
};

type MockColorPickerShape = {
  color: MockColorShape;
  listeners: Record<string, ((color: MockColorShape) => void)[]>;
  resize: () => void;
  on: (event: string, callback: (color: MockColorShape) => void) => void;
  off: (event: string, callback: (color: MockColorShape) => void) => void;
  emit: (event: string, color?: MockColorShape) => void;
};

type MockIroModule = {
  default: {
    ColorPicker: new (_target: HTMLElement, options?: { color?: string }) => MockColorPickerShape;
    ui: { Box: string; Slider: string };
  };
  instances: MockColorPickerShape[];
  MockColor: (color: string) => MockColorShape;
};

vi.stubGlobal(
  'ResizeObserver',
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

vi.mock('@jaames/iro', () => {
  const instances: MockColorPickerShape[] = [];

  function createMockColor(color: string): MockColorShape {
    let hexString = normalizeHex(color);

    const set = (newColor: string) => {
      const normalized = normalizeHex(newColor);
      hexString = normalized;
    };

    return {
      get hexString() {
        return hexString;
      },
      set hexString(value: string) {
        set(value);
      },
      get rgb() {
        return hexToRgb(hexString);
      },
      get hsv() {
        return hexToHsv(hexString);
      },
      set,
    };
  }

  class MockColorPicker implements MockColorPickerShape {
    color: MockColorShape;

    listeners: Record<string, ((color: MockColorShape) => void)[]>;

    resize: () => void;

    constructor(_target: HTMLElement, options?: { color?: string }) {
      this.color = createMockColor(options?.color ?? '#000000');
      this.listeners = {};
      this.resize = vi.fn();
      instances.push(this);
    }

    on(event: string, callback: (color: MockColorShape) => void) {
      this.listeners[event] = this.listeners[event] ?? [];
      this.listeners[event].push(callback);
    }

    off(event: string, callback: (color: MockColorShape) => void) {
      this.listeners[event] = (this.listeners[event] ?? []).filter(
        (cb: (color: MockColorShape) => void) => cb !== callback,
      );
    }

    emit(event: string, emittedColor?: MockColorShape) {
      (this.listeners[event] ?? []).forEach((listener: (color: MockColorShape) => void) => {
        listener(emittedColor ?? this.color);
      });
    }
  }

  const ColorPickerFactory = (
    target: HTMLElement,
    options?: { color?: string },
  ): MockColorPickerShape => new MockColorPicker(target, options);

  return {
    default: { ColorPicker: ColorPickerFactory, ui: { Box: 'Box', Slider: 'Slider' } },
    instances,
    MockColor: createMockColor,
  };
});

const getIroModule = () => import('@jaames/iro').then((mod) => mod as unknown as MockIroModule);

const mountPicker = async () => {
  const wrapper = mount(ColorPickerCard, {
    props: {
      id: 'test-picker',
      label: 'Base picker',
      modelValue: '#123456',
    },
  });

  await nextTick();
  return wrapper;
};

describe('ColorPickerCard', () => {
  beforeEach(async () => {
    const iro = await getIroModule();
    iro.instances.length = 0;
  });

  it('synchronizes hex input with iro pickers and emits updates', async () => {
    const wrapper = await mountPicker();
    const iro = await getIroModule();

    await wrapper.get('[data-cy="hex-input"]').setValue('#abcdef');
    await nextTick();

    expect(iro.instances.every((picker) => picker.color.hexString === '#abcdef')).toBe(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#abcdef']);
    expect(wrapper.emitted('color-change')?.[0]?.[0]).toMatchObject({ hex: '#abcdef' });
  });

  it('guards against invalid hex input', async () => {
    const wrapper = await mountPicker();

    await wrapper.get('[data-cy="hex-input"]').setValue('#zzzzzz');
    await nextTick();

    expect(wrapper.find('[data-cy="hex-error"]').exists()).toBe(true);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('updates the hex input when slider events fire', async () => {
    const wrapper = await mountPicker();
    const iro = await getIroModule();

    const sliderColor = iro.MockColor('#445566');
    iro.instances[0].emit('input:change', sliderColor);
    await nextTick();

    expect((wrapper.get('[data-cy="hex-input"]').element as HTMLInputElement).value).toBe(
      '#445566',
    );
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#445566']);
  });
});
