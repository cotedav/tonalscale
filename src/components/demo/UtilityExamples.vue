<script setup lang="ts">
  import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
  import {
    CalendarDaysIcon,
    ClockIcon,
    SparklesIcon,
    Squares2X2Icon,
  } from '@heroicons/vue/24/solid';
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLiveNow from '@/composables/useLiveNow';
  import { chunkIntoRows, uniqueTruthy } from '@/utils/collection';
  import { formatDateLabel, toUtcIsoString } from '@/utils/date';

  const { t, locale } = useI18n();

  const sampleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rawNames = ['Skyler', '', 'Skyler', null, 'Mina', undefined, 'Leo', false, 'Mina'];
  const launchDate = '2024-08-15T13:30:00Z';

  const { label: liveLabel, pause, resume } = useLiveNow();
  const isPaused = ref(false);

  const chunkedNumbers = computed(() => chunkIntoRows(sampleNumbers, 3));
  const dedupedNames = computed(() => uniqueTruthy(rawNames));

  const formattedLaunchDate = computed(() => formatDateLabel(launchDate, locale.value));
  const utcLaunchTimestamp = computed(() => toUtcIsoString(launchDate));

  const toggleClock = () => {
    if (isPaused.value) {
      resume();
    } else {
      pause();
    }

    isPaused.value = !isPaused.value;
  };

  const isDialogOpen = ref(false);

  const openDialog = () => {
    isDialogOpen.value = true;
  };

  const closeDialog = () => {
    isDialogOpen.value = false;
  };
</script>

<template>
  <section class="space-y-4">
    <div class="card-surface space-y-3">
      <div class="flex items-center gap-2 text-sm font-semibold text-primary">
        <ClockIcon class="h-5 w-5 text-accent-strong" />
        {{ t('home.utilities.clock.title') }}
      </div>
      <p class="text-sm text-tertiary">
        {{ t('home.utilities.clock.description') }}
      </p>

      <div
        class="flex items-center justify-between gap-4 rounded-xl border border-dim bg-surface-soft/60 px-4 py-3"
      >
        <div
          class="text-2xl font-semibold tracking-tight"
          data-cy="live-clock"
        >
          {{ liveLabel }}
        </div>
        <button
          type="button"
          class="rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent"
          data-cy="live-clock-toggle"
          @click="toggleClock"
        >
          {{ isPaused ? t('home.utilities.clock.resume') : t('home.utilities.clock.pause') }}
        </button>
      </div>
    </div>

    <div class="card-surface space-y-4">
      <div class="flex items-center gap-2 text-sm font-semibold text-primary">
        <Squares2X2Icon class="h-5 w-5 text-accent-strong" />
        {{ t('home.utilities.collections.title') }}
      </div>
      <p class="text-sm text-tertiary">
        {{ t('home.utilities.collections.description') }}
      </p>

      <div class="space-y-3">
        <div class="text-xs font-semibold uppercase tracking-wide text-tertiary">
          {{ t('home.utilities.collections.chunkedLabel') }}
        </div>
        <div class="space-y-2">
          <div
            v-for="(row, index) in chunkedNumbers"
            :key="`chunk-row-${index}`"
            class="grid grid-cols-3 gap-2"
          >
            <div
              v-for="number in row"
              :key="`chunk-item-${number}`"
              class="rounded-xl border border-dim bg-surface-soft px-3 py-2 text-center text-sm font-semibold text-primary"
            >
              {{ number }}
            </div>
          </div>
        </div>
      </div>

      <div class="h-px bg-dim" />

      <div class="space-y-3">
        <div class="text-xs font-semibold uppercase tracking-wide text-tertiary">
          {{ t('home.utilities.collections.uniqueLabel') }}
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="name in dedupedNames"
            :key="`name-${name}`"
            class="inline-flex items-center gap-2 rounded-full border border-accent-strong/40 bg-accent-strong/15 px-3 py-1 text-xs font-semibold text-accent-soft"
          >
            <span class="h-2 w-2 rounded-full bg-accent-soft" />
            {{ name }}
          </span>
        </div>
      </div>
    </div>

    <div class="card-surface space-y-4">
      <div class="flex items-center gap-2 text-sm font-semibold text-primary">
        <CalendarDaysIcon class="h-5 w-5 text-accent-strong" />
        {{ t('home.utilities.dates.title') }}
      </div>
      <p class="text-sm text-tertiary">
        {{ t('home.utilities.dates.description') }}
      </p>

      <div class="space-y-3">
        <div class="text-xs font-semibold uppercase tracking-wide text-tertiary">
          {{ t('home.utilities.dates.formattedLabel') }}
        </div>
        <div class="rounded-xl border border-dim bg-surface-soft px-3 py-2 text-sm text-primary">
          {{ formattedLaunchDate }}
        </div>
      </div>

      <div class="space-y-3">
        <div class="text-xs font-semibold uppercase tracking-wide text-tertiary">
          {{ t('home.utilities.dates.utcLabel') }}
        </div>
        <div
          class="rounded-xl border border-dim bg-surface-soft px-3 py-2 text-sm text-primary"
          data-cy="utc-timestamp"
        >
          {{ utcLaunchTimestamp }}
        </div>
      </div>
    </div>

    <div class="card-surface space-y-3">
      <div class="flex items-center gap-2 text-sm font-semibold text-primary">
        <SparklesIcon class="h-5 w-5 text-accent-strong" />
        {{ t('home.utilities.dialog.title') }}
      </div>
      <p class="text-sm text-tertiary">
        {{ t('home.utilities.dialog.description') }}
      </p>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-glass/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-inset ring-dim transition hover:bg-glass/15"
          data-cy="sample-dialog-trigger"
          @click="openDialog"
        >
          {{ t('home.utilities.dialog.open') }}
        </button>
      </div>

      <TransitionRoot
        as="template"
        :show="isDialogOpen"
      >
        <Dialog
          as="div"
          class="relative z-10"
          @close="closeDialog"
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
            <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </TransitionChild>

          <div class="fixed inset-0 z-10 overflow-y-auto p-4">
            <div class="flex min-h-full items-center justify-center">
              <TransitionChild
                as="template"
                enter="ease-out duration-200"
                enter-from="opacity-0 translate-y-4 scale-95"
                enter-to="opacity-100 translate-y-0 scale-100"
                leave="ease-in duration-150"
                leave-from="opacity-100 translate-y-0 scale-100"
                leave-to="opacity-0 translate-y-2 scale-95"
              >
                <DialogPanel
                  class="w-full max-w-lg rounded-2xl border border-dim bg-surface-soft p-6 shadow-2xl"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-2">
                      <Dialog.Title class="text-lg font-semibold text-primary">
                        {{ t('home.utilities.dialog.title') }}
                      </Dialog.Title>
                      <Dialog.Description class="text-sm text-tertiary">
                        {{ t('home.utilities.dialog.body') }}
                      </Dialog.Description>
                    </div>
                    <button
                      type="button"
                      class="rounded-full bg-surface-strong px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-surface"
                      @click="closeDialog"
                    >
                      {{ t('home.utilities.dialog.close') }}
                    </button>
                  </div>

                  <div
                    class="mt-4 rounded-xl border border-dim bg-surface-soft px-4 py-3 text-sm text-secondary"
                  >
                    {{ t('home.utilities.dialog.helper') }}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </section>
</template>
