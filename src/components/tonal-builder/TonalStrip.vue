<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type { TonalSwatch } from '@/composables/useTonalBuilderStrips';

  const props = defineProps<{
    swatches: TonalSwatch[];
    baseIndex: number;
    dataCy?: string;
  }>();

  const { t } = useI18n();

  const hasContent = computed(() => props.swatches.length > 0);
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-surface-soft/80 p-3"
    :data-cy="dataCy"
  >
    <p
      v-if="!hasContent"
      class="text-sm text-slate-400"
    >
      {{ t('tonal_builder.scales.empty_state') }}
    </p>

    <div
      v-else
      class="flex gap-2 overflow-x-auto pb-2"
      role="list"
    >
      <div
        v-for="swatch in swatches"
        :key="swatch.index"
        class="group relative"
        role="listitem"
      >
        <div
          class="flex min-w-[84px] flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-2 text-[10px] font-semibold text-slate-900 shadow-inner transition duration-150 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg"
          :style="{ backgroundColor: swatch.hex }"
        >
          <div
            class="flex items-center justify-between gap-1 text-[10px] uppercase leading-none text-white drop-shadow"
          >
            <span class="rounded-full bg-black/30 px-2 py-1 text-[10px] font-bold tracking-tight">
              {{ swatch.index }}
            </span>
            <span class="truncate text-[10px] tracking-wide">
              {{ swatch.hex }}
            </span>
          </div>
          <div class="flex h-2 items-center justify-center">
            <span
              v-if="swatch.isBase"
              class="h-2 w-2 rounded-full border border-white/80 bg-accent shadow-lg"
              :aria-label="t('tonal_builder.scales.base_marker', { index: baseIndex })"
              data-cy="base-marker"
            />
          </div>
        </div>

        <div
          class="pointer-events-none absolute inset-x-1/2 bottom-[-44px] z-10 w-28 -translate-x-1/2 rounded-lg bg-surface/90 px-2 py-1 text-center text-[10px] font-semibold text-slate-100 opacity-0 shadow-card backdrop-blur-sm transition duration-150 group-hover:opacity-100"
        >
          <span class="block truncate leading-tight">{{ swatch.hex.toUpperCase() }}</span>
          <span class="text-[9px] font-medium text-slate-400">
            {{ t('tonal_builder.scales.index_label', { index: swatch.index }) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
