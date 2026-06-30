<script setup lang="ts">
  import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
  } from '@headlessui/vue';

  defineProps<{
    isOpen: boolean;
    title: string;
    body: string;
    confirmLabel: string;
    cancelLabel: string;
    tone?: 'danger' | 'neutral';
  }>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'confirm'): void;
  }>();
</script>

<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
  >
    <Dialog
      as="div"
      class="relative z-[70]"
      @close="emit('cancel')"
    >
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-3 scale-95"
            enter-to="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 scale-100"
            leave-to="opacity-0 translate-y-3 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl border border-glass/15 bg-surface-soft/95 p-6 text-left align-middle shadow-xl backdrop-blur-md transition-all"
              data-cy="confirmation-dialog"
            >
              <DialogTitle
                as="h3"
                class="text-base font-semibold leading-6 text-primary"
                data-cy="confirmation-dialog-title"
              >
                {{ title }}
              </DialogTitle>
              <p
                class="mt-3 text-sm leading-6 text-secondary"
                data-cy="confirmation-dialog-body"
              >
                {{ body }}
              </p>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-lg border border-dim bg-surface px-4 text-sm font-semibold text-secondary transition hover:bg-surface-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  data-cy="confirmation-cancel"
                  @click="emit('cancel')"
                >
                  {{ cancelLabel }}
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2"
                  :class="
                    tone === 'danger'
                      ? 'bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-300'
                      : 'bg-accent-strong text-white hover:bg-accent focus-visible:ring-accent'
                  "
                  data-cy="confirmation-confirm"
                  @click="emit('confirm')"
                >
                  {{ confirmLabel }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
