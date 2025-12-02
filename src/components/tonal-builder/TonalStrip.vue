<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type { ToneMetadata } from '@/stores/tonalScale';
  import { getContrastRatio } from '@/utils/tonal/contrast';
  import type { TonalStep } from '@/utils/tonal/scale';

  const props = defineProps<{ tones: TonalStep[]; baseIndex: number; metadata?: ToneMetadata[] }>();

  const { t } = useI18n();

  const metadataByIndex = computed(() =>
    (props.metadata ?? []).reduce<Record<number, ToneMetadata>>((acc, entry) => {
      acc[entry.tone.index] = entry;
      return acc;
    }, {}),
  );

  const toneTextClass = (hex: string) => {
    const contrastWithInk = getContrastRatio(hex, '#0f172a');
    const contrastWithCanvas = getContrastRatio(hex, '#f8fafc');
    return contrastWithCanvas >= contrastWithInk ? 'text-slate-50' : 'text-slate-900';
  };

  const swatches = computed(() =>
    props.tones.map((tone) => ({
      tone,
      metadata: metadataByIndex.value[tone.index],
      textClass: toneTextClass(tone.hex),
      isBase: tone.index === props.baseIndex,
    })),
  );

  const contrastRows = (entry?: ToneMetadata) =>
    [
      {
        key: 'darker45',
        label: t('tonal_builder.scales.metadata.darker_45'),
        candidate: entry?.darker45,
      },
      {
        key: 'darker3',
        label: t('tonal_builder.scales.metadata.darker_3'),
        candidate: entry?.darker3,
      },
      {
        key: 'lighter3',
        label: t('tonal_builder.scales.metadata.lighter_3'),
        candidate: entry?.lighter3,
      },
      {
        key: 'lighter45',
        label: t('tonal_builder.scales.metadata.lighter_45'),
        candidate: entry?.lighter45,
      },
    ].filter((row) => Boolean(row.candidate));
</script>

<template>
  <div
    class="color-scale-container relative min-h-[72px] rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-3"
  >
    <div
      class="overflow-x-auto"
      data-cy="tonal-strip"
    >
      <div
        class="flex min-w-max gap-2"
        role="list"
      >
        <div
          v-for="swatch in swatches"
          :key="swatch.tone.index"
          class="group relative flex min-w-[84px] flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 shadow-inner backdrop-blur transition duration-150 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow focus-within:-translate-y-1 focus-within:scale-[1.02] focus-within:shadow-glow"
          :style="{ backgroundColor: swatch.tone.hex }"
          :aria-label="
            t('tonal_builder.scales.metadata.swatch_label', {
              index: swatch.tone.index,
              hex: swatch.tone.hex,
            })
          "
          data-cy="tonal-swatch"
          :data-index="swatch.tone.index"
          role="listitem"
          tabindex="0"
        >
          <div
            class="flex items-start justify-between gap-1 rounded-b-lg bg-slate-950/40 px-2 py-2 backdrop-blur-sm"
          >
            <span
              class="text-[11px] font-semibold tracking-tight text-slate-100"
              data-cy="tone-index"
            >
              {{ swatch.tone.index }}
            </span>
            <span
              class="rounded bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-100 shadow-inner"
              data-cy="tone-hex"
            >
              {{ swatch.tone.hex }}
            </span>
          </div>

          <div class="flex flex-1 items-center justify-center px-2 pb-3 pt-2">
            <div
              class="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow backdrop-blur"
              :class="swatch.textClass"
            >
              <span class="tabular-nums">{{
                t('tonal_builder.scales.metadata.index_label', { index: swatch.tone.index })
              }}</span>
              <span
                class="h-1 w-px rounded-full bg-current opacity-60"
                aria-hidden="true"
              />
              <span class="tabular-nums">{{ swatch.tone.hex }}</span>
            </div>
          </div>

          <div
            v-if="swatch.isBase"
            class="absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
            data-cy="base-marker"
          >
            <span
              class="h-2 w-2 rounded-full bg-accent-strong shadow-[0_0_0_6px_rgba(255,255,255,0.35)]"
              aria-hidden="true"
            />
            <span
              class="rounded-full bg-surface/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-strong shadow"
            >
              {{ t('tonal_builder.scales.metadata.base_marker') }}
            </span>
          </div>

          <div
            class="pointer-events-none absolute inset-x-1 bottom-1 z-10 opacity-0 transition duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <div
              class="rounded-xl border border-white/15 bg-surface/80 p-3 text-slate-100 shadow-lg backdrop-blur"
              data-cy="tone-metadata"
            >
              <p class="text-xs font-semibold uppercase tracking-wide text-accent-soft">
                {{ t('tonal_builder.scales.metadata.title') }}
              </p>
              <p class="text-[11px] font-semibold text-white">{{ swatch.tone.hex }}</p>
              <div class="mt-2 space-y-1 text-[10px] leading-4 text-slate-200">
                <p class="font-semibold text-slate-100">
                  {{ t('tonal_builder.scales.metadata.contrast_label') }}
                </p>
                <div
                  v-for="row in contrastRows(swatch.metadata)"
                  :key="row.key"
                  class="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1"
                >
                  <span class="font-medium">{{ row.label }}</span>
                  <span class="tabular-nums text-[11px] font-semibold text-white">
                    {{ row.candidate?.index }} · {{ row.candidate?.hex }}
                  </span>
                </div>
                <p
                  v-if="!contrastRows(swatch.metadata).length"
                  class="text-[10px] text-slate-300"
                >
                  {{ t('tonal_builder.scales.metadata.empty') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
