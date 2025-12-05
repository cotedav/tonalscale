import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

export const useClipboard = () => {
  const { t } = useI18n();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.clipboard.success', { label }));
      return true;
    } catch (error) {
      console.error('Clipboard copy failed', error);
      toast.error(t('common.clipboard.error'));
      return false;
    }
  };

  return { copyToClipboard };
};
