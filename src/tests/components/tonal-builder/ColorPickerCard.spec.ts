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
  __instances: MockColorPickerShape[];
  MockColor: new (color: string) => MockColorShape;
};

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}

    unobserve() {}

    disconnect() {}
  },
);

vi.mock('@jaames/iro', () => {
  class MockColor implements MockColorShape {
    hexString: string;

    rgb: RgbColor;

    hsv: HsvColor;

    constructor(color: string) {
      this.hexString = normalizeHex(color);
      this.rgb = hexToRgb(this.hexString);
      this.hsv = hexToHsv(this.hexString);
    }

    set(color: string) {
      const normalized = normalizeHex(color);
      this.hexString = normalized;
      this.rgb = hexToRgb(normalized);
      this.hsv = hexToHsv(normalized);
    }
  }

  class MockColorPicker implements MockColorPickerShape {
    color: MockColor;

    listeners: Record<string, ((color: MockColor) => void)[]> = {};

    resize = vi.fn();

    constructor(_target: HTMLElement, options?: { color?: string }) {
      this.color = new MockColor(options?.color ?? '#000000');
      instances.push(this);
    }

    on(event: string, callback: (color: MockColor) => void) {
      this.listeners[event] = this.listeners[event] ?? [];
      this.listeners[event].push(callback);
    }

    off(event: string, callback: (color: MockColor) => void) {
      this.listeners[event] = (this.listeners[event] ?? []).filter((cb) => cb !== callback);
    }

    emit(event: string, color?: MockColor) {
      (this.listeners[event] ?? []).forEach((callback) => callback(color ?? this.color));
    }
  }

  const instances: MockColorPickerShape[] = [];

  return {
    default: { ColorPicker: MockColorPicker, ui: { Box: 'Box', Slider: 'Slider' } },
    __instances: instances,
    MockColor,
  };
});

const getIroModule = () => import('@jaames/iro') as Promise<MockIroModule>;

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
    iro.__instances.length = 0;
  });

  it('synchronizes hex input with iro pickers and emits updates', async () => {
    const wrapper = await mountPicker();
    const iro = await getIroModule();

    await wrapper.get('[data-cy="hex-input"]').setValue('#abcdef');
    await nextTick();

    expect(iro.__instances.every((picker) => picker.color.hexString === '#abcdef')).toBe(true);
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

    const sliderColor = new iro.MockColor('#445566');
    iro.__instances[0].emit('input:change', sliderColor);
    await nextTick();

    expect((wrapper.get('[data-cy="hex-input"]').element as HTMLInputElement).value).toBe(
      '#445566',
    );
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#445566']);
  });
});
