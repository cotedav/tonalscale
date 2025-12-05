import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

/* eslint-disable import/prefer-default-export */
export const useClipboard = () => {
  const { t } = useI18n();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.clipboard.success', { label }));
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Clipboard copy failed', error);
      toast.error(t('common.clipboard.error'));
      return false;
    }
  };

  return { copyToClipboard };
};
