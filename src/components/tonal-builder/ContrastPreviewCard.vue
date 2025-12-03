<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { getContrastRatio } from '@/utils/tonal/contrast';

  type ContrastColor = {
    index: number;
    hex: string;
  } | null;

  type LevelKey = 'large_aa' | 'large_aaa' | 'regular_aa' | 'regular_aaa';

  const props = defineProps<{
    id: string;
    titleKey: string;
    ratioLabel: string;
    background: ContrastColor;
    text: ContrastColor;
  }>();

  const { t } = useI18n();

  const hasPair = computed(() => Boolean(props.background && props.text));

  const formatContrastRatio = (value: number) =>
    value
      .toFixed(2)
      .replace(/\.0+$/, '')
      .replace(/\.(\d*[1-9])0+$/, '.$1');

  const contrastRatio = computed(() => {
    if (!props.background || !props.text) return null;
    return getContrastRatio(props.background.hex, props.text.hex);
  });

  const ratioDisplay = computed(() =>
    contrastRatio.value === null
      ? props.ratioLabel
      : `${formatContrastRatio(contrastRatio.value)}:1`,
  );

  const styles = computed(() => ({
    '--bkg': props.background?.hex ?? 'transparent',
    '--txt': props.text?.hex ?? '#e2e8f0',
    opacity: hasPair.value ? 1 : 0.55,
  }));

  const levels = computed<Array<{ key: LevelKey; threshold: number; value: boolean }>>(() => {
    const ratio = contrastRatio.value ?? 0;
    return [
      { key: 'large_aa', threshold: 3, value: ratio >= 3 },
      { key: 'large_aaa', threshold: 4.5, value: ratio >= 4.5 },
      { key: 'regular_aa', threshold: 4.5, value: ratio >= 4.5 },
      { key: 'regular_aaa', threshold: 7, value: ratio >= 7 },
    ];
  });

  const levelLabel = (key: LevelKey) => t(`tonal_builder.accessibility.levels.${key}`);
</script>

<template>
  <article
    :id="id"
    class="colorcard"
    :style="styles"
    data-cy="contrast-preview-card"
  >
    <header class="colorcard-header">
      <h1>{{ ratioDisplay }}</h1>
      <p class="text-xs uppercase tracking-wide text-slate-400">
        {{ t(titleKey) }}
      </p>
    </header>

    <section
      class="colorcard-colorrefs"
      :aria-label="t('tonal_builder.accessibility.preview_links')"
    >
      <div
        class="colorcard-colorref_bkg"
        role="presentation"
      >
        <label>{{
          t('tonal_builder.scales.metadata.index_label', { index: background?.index ?? '—' })
        }}</label>
        <span class="colorcard-colorref-index">{{ background?.index ?? '—' }}</span>
        <label>{{ t('tonal_builder.accessibility.hex_label') }}</label>
        <span class="colorcard-colorref-hex">{{ background?.hex?.toUpperCase() ?? '—' }}</span>
      </div>
      <div
        class="colorcard-colorref_txt"
        role="presentation"
      >
        <label>{{
          t('tonal_builder.scales.metadata.index_label', { index: text?.index ?? '—' })
        }}</label>
        <span class="colorcard-colorref-index">{{ text?.index ?? '—' }}</span>
        <label>{{ t('tonal_builder.accessibility.hex_label') }}</label>
        <span class="colorcard-colorref-hex">{{ text?.hex?.toUpperCase() ?? '—' }}</span>
      </div>
    </section>

    <div
      class="colorcard-divider"
      aria-hidden="true"
    />

    <h2>{{ t('tonal_builder.accessibility.large_heading') }}</h2>
    <span
      v-for="level in levels.slice(0, 2)"
      :key="level.key"
      class="colorcard-wcaglevel"
      :class="level.value ? 'colorcard-wcaglevel_pass' : 'colorcard-wcaglevel_fail'"
    >
      <span class="material-icons icon-pass">check</span>
      <span class="material-icons icon-fail">close</span>
      {{ levelLabel(level.key) }}
    </span>
    <p class="colorcard-large_20">{{ t('tonal_builder.accessibility.sample_large') }}</p>
    <p class="colorcard-large_14">{{ t('tonal_builder.accessibility.sample_large_bold') }}</p>

    <div
      class="colorcard-icons"
      aria-hidden="true"
    >
      <div class="colorcard-icons_bkg">
        <span class="material-icons">check</span>
        <span class="material-icons">info</span>
        <span class="material-icons">warning</span>
      </div>
      <div class="colorcard-icons_txt">
        <span class="material-icons">check</span>
        <span class="material-icons">info</span>
        <span class="material-icons">warning</span>
      </div>
    </div>

    <div
      class="colorcard-divider"
      aria-hidden="true"
    />

    <h2>{{ t('tonal_builder.accessibility.regular_heading') }}</h2>
    <span
      v-for="level in levels.slice(2)"
      :key="level.key"
      class="colorcard-wcaglevel"
      :class="level.value ? 'colorcard-wcaglevel_pass' : 'colorcard-wcaglevel_fail'"
    >
      <span class="material-icons icon-pass">check</span>
      <span class="material-icons icon-fail">close</span>
      {{ levelLabel(level.key) }}
    </span>
    <p class="colorcard-regular_16">{{ t('tonal_builder.accessibility.sample_regular') }}</p>
    <p class="colorcard-regular_12">{{ t('tonal_builder.accessibility.sample_regular_bold') }}</p>
  </article>
</template>

<style scoped>
  .colorcard {
    --txt: #e2e8f0;
    --bkg: #0f172a;

    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px dashed rgb(255 255 255 / 15%);
    border-radius: 24px;
    background: linear-gradient(135deg, rgb(15 23 42 / 90%), rgb(15 23 42 / 70%));
    padding: 14px;
    box-shadow: 0 20px 40px rgb(0 0 0 / 35%);
    color: #e2e8f0;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .colorcard:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 60px rgb(0 0 0 / 45%);
  }

  .colorcard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .colorcard h1 {
    font-family: 'Roboto Mono', monospace;
    font-size: 24px;
    margin: 0;
  }

  .colorcard h2 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #cbd5e1;
    margin: 2px 0;
  }

  .colorcard .colorcard-colorrefs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    font-family: 'Roboto Mono', monospace;
  }

  .colorcard .colorcard-colorrefs label {
    font-size: 10px;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .colorcard .colorcard-colorref_bkg,
  .colorcard .colorcard-colorref_txt {
    padding: 10px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgb(15 23 42 / 60%), rgb(15 23 42 / 40%));
    border: 1px solid rgb(255 255 255 / 10%);
  }

  .colorcard .colorcard-colorref_txt {
    background: linear-gradient(135deg, rgb(255 255 255 / 14%), rgb(148 163 184 / 12%));
    color: #0f172a;
  }

  .colorcard .colorcard-colorref-index,
  .colorcard .colorcard-colorref-hex {
    display: block;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .colorcard .colorcard-divider {
    height: 1px;
    width: 100%;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 40%), transparent);
    margin: 6px 0;
  }

  .colorcard .colorcard-wcaglevel {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    border: 1px solid rgb(255 255 255 / 20%);
    background: rgb(255 255 255 / 4%);
    margin-right: 6px;
  }

  .colorcard .colorcard-wcaglevel .material-icons {
    font-size: 16px;
  }

  .colorcard .colorcard-wcaglevel_pass {
    color: #16a34a;
    background: rgb(22 163 74 / 12%);
    border-color: rgb(22 163 74 / 35%);
  }

  .colorcard .colorcard-wcaglevel_fail {
    color: #f97316;
    background: rgb(249 115 22 / 12%);
    border-color: rgb(249 115 22 / 35%);
  }

  .colorcard .colorcard-wcaglevel_pass .icon-pass,
  .colorcard .colorcard-wcaglevel_fail .icon-fail {
    display: inline;
  }

  .colorcard .colorcard-wcaglevel_pass .icon-fail,
  .colorcard .colorcard-wcaglevel_fail .icon-pass {
    display: none;
  }

  .colorcard p {
    margin: 4px 0;
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px dashed rgb(255 255 255 / 10%);
  }

  .colorcard .colorcard-large_20,
  .colorcard .colorcard-large_14,
  .colorcard .colorcard-regular_16,
  .colorcard .colorcard-regular_12 {
    background: linear-gradient(135deg, rgb(15 23 42 / 75%), rgb(15 23 42 / 55%));
    color: var(--txt);
  }

  .colorcard .colorcard-large_20 {
    font-size: 20px;
    background: linear-gradient(135deg, rgb(255 255 255 / 10%), rgb(148 163 184 / 20%));
    color: var(--bkg);
  }

  .colorcard .colorcard-large_14 {
    font-size: 14px;
    font-weight: 700;
  }

  .colorcard .colorcard-icons {
    display: flex;
    gap: 6px;
    align-items: stretch;
    justify-content: space-between;
  }

  .colorcard .colorcard-icons_bkg,
  .colorcard .colorcard-icons_txt {
    display: inline-flex;
    gap: 6px;
    padding: 8px;
    border-radius: 12px;
    border: 1px solid rgb(255 255 255 / 10%);
  }

  .colorcard .colorcard-icons_txt {
    color: var(--bkg);
    background: linear-gradient(135deg, rgb(255 255 255 / 16%), rgb(148 163 184 / 22%));
  }

  .colorcard .colorcard-regular_16 {
    font-size: 16px;
    color: var(--txt);
  }

  .colorcard .colorcard-regular_12 {
    font-size: 12px;
    font-weight: 700;
    color: var(--txt);
  }

  @media (width <= 640px) {
    .colorcard {
      border-radius: 18px;
    }

    .colorcard h1 {
      font-size: 20px;
    }
  }
</style>
