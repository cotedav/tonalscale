import { computed, ref } from 'vue';

import { buildScaleSvg, type TonalStripExport } from '@/utils/tonal/export';

export type ClipboardToast = {
  message: string;
  variant: 'success' | 'error' | 'info';
};

type ClipboardMessages = {
  success: string;
  error: string;
  missing?: string;
  unsupported?: string;
};

const supportsClipboard = () =>
  typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';

export const useClipboardActions = () => {
  const toast = ref<ClipboardToast | null>(null);
  let timer: number | undefined;

  const isSupported = computed(() => supportsClipboard());

  const setToast = (message: string, variant: ClipboardToast['variant'] = 'success') => {
    toast.value = { message, variant };
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      toast.value = null;
    }, 2400);
  };

  const writeClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const copyText = async (value: string, messages: ClipboardMessages) => {
    if (!value) {
      setToast(messages.missing ?? messages.error, 'error');
      return false;
    }
    if (!isSupported.value) {
      setToast(messages.unsupported ?? messages.error, 'error');
      return false;
    }

    try {
      await writeClipboard(value);
      setToast(messages.success, 'success');
      return true;
    } catch {
      setToast(messages.error, 'error');
      return false;
    }
  };

  const copyScaleSvg = async (
    strips: TonalStripExport[],
    metadata: { url: string; exportJson: string },
    messages: ClipboardMessages,
  ) => {
    const svg = buildScaleSvg(strips, metadata);
    const result = await copyText(svg, messages);
    return result ? svg : null;
  };

  const clearToast = () => {
    window.clearTimeout(timer);
    toast.value = null;
  };

  return {
    copyScaleSvg,
    copyText,
    clearToast,
    isSupported,
    toast: computed(() => toast.value),
  };
};
