import { describe, it, expect, beforeEach } from 'vitest';
import { useContextMenu, type ContextMenuContext } from '@/composables/useContextMenu';
import type { TonalStep } from '@/utils/tonal/scale';

describe('useContextMenu', () => {
  const { open, close, isOpen, position, contextData } = useContextMenu();

  beforeEach(() => {
    close();
  });

  const mockTone: TonalStep = {
    index: 500,
    hex: '#808080',
  };

  it('should be closed by default', () => {
    expect(isOpen.value).toBe(false);
    expect(contextData.value).toBeNull();
  });

  it('should open with correct position and data', () => {
    const mockEvent = {
      preventDefault: () => {},
      clientX: 100,
      clientY: 200,
    } as unknown as MouseEvent;

    const mockData: ContextMenuContext = {
      token: 'tone',
      tone: mockTone,
    };

    open(mockEvent, mockData);

    expect(isOpen.value).toBe(true);
    expect(position.value).toEqual({ x: 100, y: 200 });
    expect(contextData.value).toEqual(mockData);
  });

  it('should close and clear data', () => {
    const mockEvent = {
      preventDefault: () => {},
      clientX: 100,
      clientY: 200,
    } as unknown as MouseEvent;

    open(mockEvent, { token: 'tone' });
    expect(isOpen.value).toBe(true);

    close();

    expect(isOpen.value).toBe(false);
    expect(contextData.value).toBeNull();
  });

  it('should act as a singleton (shared state)', () => {
    const instanceA = useContextMenu();
    const instanceB = useContextMenu();

    const mockEvent = {
      preventDefault: () => {},
      clientX: 50,
      clientY: 50,
    } as unknown as MouseEvent;

    instanceA.open(mockEvent, { token: 'tone' });

    expect(instanceB.isOpen.value).toBe(true);
    expect(instanceB.position.value).toEqual({ x: 50, y: 50 });
  });

  it('should toggle if opened again (force close logic)', async () => {
    const mockEvent = {
      preventDefault: () => {},
      clientX: 100,
      clientY: 200,
    } as unknown as MouseEvent;

    await open(mockEvent, { token: 'tone' });
    expect(isOpen.value).toBe(true);

    const mockEvent2 = {
      preventDefault: () => {},
      clientX: 300,
      clientY: 400,
    } as unknown as MouseEvent;

    await open(mockEvent2, { token: 'tone' });

    expect(isOpen.value).toBe(true);
    expect(position.value).toEqual({ x: 300, y: 400 });
  });
});
