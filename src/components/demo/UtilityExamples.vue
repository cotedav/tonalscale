<script setup lang="ts">
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
</script>

<template>
  <section class="d-flex flex-column gap-4">
    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1 font-weight-medium d-flex align-center gap-2">
        <v-icon
          icon="mdi-clock-outline"
          color="primary"
        />
        {{ t('home.utilities.clock.title') }}
      </v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <div class="text-body-2 text-medium-emphasis">
          {{ t('home.utilities.clock.description') }}
        </div>

        <div class="d-flex align-center justify-space-between">
          <div
            class="text-h6"
            data-cy="live-clock"
          >
            {{ liveLabel }}
          </div>
          <v-btn
            color="primary"
            variant="tonal"
            data-cy="live-clock-toggle"
            @click="toggleClock"
          >
            {{ isPaused ? t('home.utilities.clock.resume') : t('home.utilities.clock.pause') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1 font-weight-medium d-flex align-center gap-2">
        <v-icon
          icon="mdi-apps"
          color="primary"
        />
        {{ t('home.utilities.collections.title') }}
      </v-card-title>
      <v-card-text class="d-flex flex-column gap-4">
        <div class="text-body-2 text-medium-emphasis">
          {{ t('home.utilities.collections.description') }}
        </div>

        <div class="d-flex flex-column gap-2">
          <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">
            {{ t('home.utilities.collections.chunkedLabel') }}
          </div>
          <div class="d-flex flex-column gap-2">
            <v-row
              v-for="(row, index) in chunkedNumbers"
              :key="`chunk-row-${index}`"
              dense
            >
              <v-col
                v-for="number in row"
                :key="`chunk-item-${number}`"
                cols="4"
                class="py-1"
              >
                <v-chip
                  color="primary"
                  label
                  variant="tonal"
                  class="w-100 justify-center"
                >
                  {{ number }}
                </v-chip>
              </v-col>
            </v-row>
          </div>
        </div>

        <v-divider />

        <div class="d-flex flex-column gap-2">
          <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">
            {{ t('home.utilities.collections.uniqueLabel') }}
          </div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="name in dedupedNames"
              :key="`name-${name}`"
              color="secondary"
              label
              variant="tonal"
            >
              {{ name }}
            </v-chip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1 font-weight-medium d-flex align-center gap-2">
        <v-icon
          icon="mdi-calendar-clock"
          color="primary"
        />
        {{ t('home.utilities.dates.title') }}
      </v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <div class="text-body-2 text-medium-emphasis">
          {{ t('home.utilities.dates.description') }}
        </div>

        <div class="d-flex flex-column gap-1">
          <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">
            {{ t('home.utilities.dates.formattedLabel') }}
          </div>
          <div class="text-body-1">{{ formattedLaunchDate }}</div>
        </div>

        <div class="d-flex flex-column gap-1">
          <div class="text-caption text-uppercase font-weight-medium text-medium-emphasis">
            {{ t('home.utilities.dates.utcLabel') }}
          </div>
          <div
            class="text-body-1"
            data-cy="utc-timestamp"
          >
            {{ utcLaunchTimestamp }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </section>
</template>
