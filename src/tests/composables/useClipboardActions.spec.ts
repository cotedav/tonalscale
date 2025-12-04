import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useClipboardActions } from '@/composables/useClipboardActions';

const buildClipboard = () => ({
  writeText: vi.fn().mockResolvedValue(undefined),
  read: vi.fn(),
  readText: vi.fn(),
  write: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('useClipboardActions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('navigator', { clipboard: buildClipboard() } satisfies Partial<Navigator>);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('copies text and sets toast state', async () => {
    const { copyText, toast } = useClipboardActions();

    await copyText('#abc123', {
      success: 'copied',
      error: 'error',
    });

    expect(navigator.clipboard?.writeText).toHaveBeenCalledWith('#abc123');
    expect(toast.value?.message).toBe('copied');
    expect(toast.value?.variant).toBe('success');
  });

  it('guards unsupported clipboard writes', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined } satisfies Partial<Navigator>);
    const { copyText, toast } = useClipboardActions();

    await copyText('#abc123', {
      success: 'copied',
      error: 'error',
      unsupported: 'nope',
    });

    expect(toast.value?.message).toBe('nope');
    expect(toast.value?.variant).toBe('error');
  });
});
