import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'vue-sonner';
import { useClipboard } from '@/composables/useClipboard';

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('useClipboard', () => {
  const { copyToClipboard } = useClipboard();

  // Mock navigator.clipboard
  const writeTextMock = vi.fn();

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    writeTextMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should write text to clipboard and show success toast', async () => {
    await copyToClipboard('test-string', 'Label');

    expect(writeTextMock).toHaveBeenCalledWith('test-string');
    expect(toast.success).toHaveBeenCalled();
  });

  it('should show success toast with custom message', async () => {
    await copyToClipboard('test', 'Label');

    expect(toast.success).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    writeTextMock.mockRejectedValue(new Error('Failed'));

    await copyToClipboard('test', 'Label');

    expect(writeTextMock).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
