<script setup lang="ts">
  import { ref, watch } from 'vue';
  import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
  } from '@headlessui/vue';
  import { useI18n } from 'vue-i18n';
  import { toast } from 'vue-sonner';
  import { useTonalScaleStore } from '@/stores/tonalScale';
  import { useClipboard } from '@/composables/useClipboard';

  const props = defineProps<{
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const { t } = useI18n();
  const store = useTonalScaleStore();
  const { copyToClipboard } = useClipboard();

  const jsonInput = ref('');
  const isValid = ref(true);

  // Update input when modal opens or params change while open
  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        jsonInput.value = store.serializedParams;
        isValid.value = true;
      }
    },
    { immediate: true },
  );

  // If store updates while open (e.g. via other controls), we might want to update the text?
  // Maybe not, avoids overwriting user edits. But if user hasn't edited, we should?
  // For now, let's keep it simple: load on open.

  const handleClose = () => {
    emit('close');
  };

  const handleCopy = async () => {
    await copyToClipboard(jsonInput.value, 'JSON');
  };

  const handleImport = () => {
    if (!jsonInput.value.trim()) return;

    try {
      const success = store.importState(jsonInput.value);
      if (success) {
        toast.success(t('tonal_builder.actions.import_success'));
        emit('close');
      } else {
        toast.error(t('tonal_builder.actions.import_error'));
      }
    } catch {
      toast.error(t('tonal_builder.actions.import_error'));
    }
  };
</script>

<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
  >
    <Dialog
      as="div"
      class="relative z-50"
      @close="handleClose"
    >
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-2xl border border-glass/15 bg-surface-soft/95 text-left shadow-xl backdrop-blur-md transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <div class="flex items-center justify-between">
                      <DialogTitle
                        as="h3"
                        class="text-base font-semibold leading-6 text-primary"
                      >
                        {{ t('tonal_builder.modals.dialog_title') }}
                      </DialogTitle>
                      <button
                        type="button"
                        class="translate-x-4 -translate-y-4 rounded-full p-2 text-tertiary hover:text-primary focus:outline-none"
                        @click="handleClose"
                      >
                        <span class="sr-only">{{ t('tonal_builder.modals.close_label') }}</span>
                        <svg
                          class="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div class="mt-2 text-sm text-tertiary">
                      <p>
                        {{
                          t(
                            'tonal_builder.modals.dialog_helper',
                            'Paste your JSON configuration below to restore a previous state.',
                          )
                        }}
                      </p>
                    </div>
                    <div class="mt-4">
                      <textarea
                        v-model="jsonInput"
                        rows="8"
                        class="w-full rounded-xl border border-dim bg-surface/60 p-3 text-xs font-mono text-secondary shadow-inner focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-3 bg-surface/50 px-4 py-3 sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong sm:ml-3 sm:w-auto"
                  data-cy="modal-import-btn"
                  @click="handleImport"
                >
                  {{ t('tonal_builder.actions.import') }}
                </button>
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-xl bg-surface-strong px-3 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-dim transition hover:bg-surface sm:mt-0 sm:w-auto"
                  @click="handleCopy"
                >
                  {{ t('tonal_builder.actions.copy_json') }}
                </button>
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-xl bg-transparent px-3 py-2 text-sm font-semibold text-tertiary hover:text-primary sm:mr-auto sm:w-auto"
                  @click="handleClose"
                >
                  {{ t('tonal_builder.actions.cancel') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
