import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import {
  EXTENDED_SCALE_INDICES,
  KEY_SCALE_INDICES,
  type TonalScaleSnapshot,
  useTonalScaleStore,
} from '@/stores/tonalScale';
import { getContrastRatio } from '@/utils/tonal/contrast';

const flushTimers = async () => {
  vi.runAllTimers();
  await vi.runAllTimersAsync();
};

describe('useTonalScaleStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
  });

  it('initializes defaults and exposes derived strips', async () => {
    const store = useTonalScaleStore();
    await flushTimers();

    expect(store.baseHex).toBe('#8000ff');
    expect(store.blendHex).toBe('#000032');
    expect(store.fullStrip).toHaveLength(101);
    expect(store.extendedStrip.length).toBeGreaterThanOrEqual(EXTENDED_SCALE_INDICES.length);
    expect(store.keyStrip.length).toBeGreaterThanOrEqual(KEY_SCALE_INDICES.length);

    const baseTone = store.fullStrip.find((step) => step.index === store.scale.luminance);
    expect(baseTone?.hex).toBe('#8000ff');
    expect(store.extendedStrip.some((step) => step.index === store.scale.luminance)).toBe(true);
    expect(store.keyStrip.some((step) => step.index === store.scale.luminance)).toBe(true);
  });

  it('broadcasts snapshots when parameters change', async () => {
    const store = useTonalScaleStore();
    const snapshots: TonalScaleSnapshot[] = [];
    store.onSnapshot((snapshot) => snapshots.push(snapshot));

    store.setBaseHex('#3366ff');
    store.updateControl('strength', 25);
    await flushTimers();

    expect(snapshots.length).toBeGreaterThan(1);
    const latest = snapshots.at(-1)!;
    expect(latest.params.colorHex).toBe('#3366ff');
    expect(latest.params.blendStrength).toBe(25);
    expect(latest.fullStrip.find((step) => step.index === latest.scale.luminance)?.hex).toBe(
      '#3366ff',
    );
  });

  it('imports and exports state payloads', async () => {
    const store = useTonalScaleStore();
    await flushTimers();
    const baseline = store.exportState();

    store.setBaseHex('#123456');
    store.setBlendHex('#654321');
    store.updateControl('middle', 10);
    await flushTimers();

    const imported = store.importState(baseline);
    await flushTimers();

    expect(imported).toBe(true);
    expect(store.baseHex).toBe('#8000ff');
    expect(store.blendHex).toBe('#000032');
    expect(store.controls.middle).toBe(0);
  });

  it('refreshes only once for import and default load operations', async () => {
    const store = useTonalScaleStore();
    const snapshots: TonalScaleSnapshot[] = [];
    store.onSnapshot((snapshot) => snapshots.push(snapshot));

    const defaultPayload = store.exportState();
    await flushTimers();

    store.setBaseHex('#123456');
    await flushTimers();
    const countAfterChange = snapshots.length;

    store.importState(defaultPayload);
    await flushTimers();

    expect(snapshots.length - countAfterChange).toBe(1);
    expect(snapshots.at(-1)?.baseHex).toBe('#8000ff');

    store.setBlendHex('#abcdef');
    await flushTimers();
    const countAfterBlendChange = snapshots.length;

    store.loadDefaults();
    await flushTimers();

    expect(snapshots.length - countAfterBlendChange).toBe(1);
    expect(snapshots.at(-1)?.blendHex).toBe('#000032');
  });

  it('safely rejects malformed import payloads', async () => {
    const store = useTonalScaleStore();
    await flushTimers();

    expect(store.importState('{invalid json')).toBe(false);
    await flushTimers();

    expect(store.baseHex).toBe('#8000ff');
  });

  it('computes contrast metadata for each tone', async () => {
    const store = useTonalScaleStore();
    await flushTimers();

    const supportedMeta = store.metadata.find((meta) => meta.darker3 && meta.lighter3);
    expect(supportedMeta).toBeDefined();
    expect(supportedMeta?.darker3?.ratio).toBeGreaterThanOrEqual(3);

    const calculated = getContrastRatio(
      supportedMeta?.tone.hex ?? '#000000',
      supportedMeta?.lighter45?.hex ?? supportedMeta?.lighter3?.hex ?? '#ffffff',
    );
    expect(calculated).toBeGreaterThanOrEqual(3);
  });
});
