<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
  } from '@heroicons/vue/24/solid';

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
    '--bkg': props.background?.hex ?? '#77777e',
    '--txt': props.text?.hex ?? '#e2e2e4',
    opacity: hasPair.value ? 1 : 0.2,
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
    :aria-label="t(titleKey)"
  >
    <h1>{{ ratioDisplay }}</h1>

    <section
      class="colorcard-colorrefs"
      :aria-label="t('tonal_builder.accessibility.preview_links')"
    >
      <div
        class="colorcard-colorref_bkg"
        role="presentation"
      >
        <label>{{ t('tonal_builder.accessibility.index_label') }}</label>
        <span class="colorcard-colorref-index">{{ background?.index ?? '—' }}</span>
        <label>{{ t('tonal_builder.accessibility.hex_label') }}</label>
        <span class="colorcard-colorref-hex">{{ background?.hex?.toUpperCase() ?? '—' }}</span>
      </div>
      <div
        class="colorcard-colorref_txt"
        role="presentation"
      >
        <label>{{ t('tonal_builder.accessibility.index_label') }}</label>
        <span class="colorcard-colorref-index">{{ text?.index ?? '—' }}</span>
        <label>{{ t('tonal_builder.accessibility.hex_label') }}</label>
        <span class="colorcard-colorref-hex">{{ text?.hex?.toUpperCase() ?? '—' }}</span>
      </div>
    </section>

    <div
      class="colorcard-divider"
      aria-hidden="true"
    />

    <div class="colorcard-heading">
      <h2>{{ t('tonal_builder.accessibility.large_heading') }}</h2>
      <div class="colorcard-wcaglevels">
        <span
          v-for="level in levels.slice(0, 2)"
          :key="level.key"
          class="colorcard-wcaglevel"
          :class="level.value ? 'colorcard-wcaglevel_pass' : 'colorcard-wcaglevel_fail'"
        >
          <CheckIcon
            class="icon-pass"
            aria-hidden="true"
          />
          <XMarkIcon
            class="icon-fail"
            aria-hidden="true"
          />
          {{ levelLabel(level.key) }}
        </span>
      </div>
    </div>
    <p class="colorcard-large_20">{{ t('tonal_builder.accessibility.sample_large') }}</p>
    <p class="colorcard-large_14">{{ t('tonal_builder.accessibility.sample_large_bold') }}</p>

    <div
      class="colorcard-icons"
      aria-hidden="true"
    >
      <div class="colorcard-icons_bkg">
        <CheckIcon />
        <InformationCircleIcon />
        <ExclamationTriangleIcon />
      </div>
      <div class="colorcard-icons_txt">
        <CheckIcon />
        <InformationCircleIcon />
        <ExclamationTriangleIcon />
      </div>
    </div>

    <div
      class="colorcard-divider"
      aria-hidden="true"
    />

    <div class="colorcard-heading">
      <h2>{{ t('tonal_builder.accessibility.regular_heading') }}</h2>
      <div class="colorcard-wcaglevels">
        <span
          v-for="level in levels.slice(2)"
          :key="level.key"
          class="colorcard-wcaglevel"
          :class="level.value ? 'colorcard-wcaglevel_pass' : 'colorcard-wcaglevel_fail'"
        >
          <CheckIcon
            class="icon-pass"
            aria-hidden="true"
          />
          <XMarkIcon
            class="icon-fail"
            aria-hidden="true"
          />
          {{ levelLabel(level.key) }}
        </span>
      </div>
    </div>
    <p class="colorcard-regular_16">{{ t('tonal_builder.accessibility.sample_regular') }}</p>
    <p class="colorcard-regular_12">{{ t('tonal_builder.accessibility.sample_regular_bold') }}</p>
  </article>
</template>

<style scoped>
  .colorcard {
    --txt: #e2e2e4;
    --bkg: #77777e;

    color: var(--txt);
    background: linear-gradient(to right, var(--bkg) 50%, var(--txt) 50%);
    padding: 16px;
    border-radius: 16px;
    opacity: 0.2;
    flex: 1;
    min-width: 200px;
  }

  .colorcard h1 {
    margin: 0 0 16px;
    font-size: 34px;
    font-weight: 400;
  }

  .colorcard h2 {
    margin: 0;
    font-weight: 500;
    font-size: 12px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .colorcard .colorcard-heading {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px 8px;
    margin-bottom: 8px;
  }

  .colorcard .colorcard-wcaglevels {
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px 8px;
  }

  .colorcard .colorcard-colorrefs {
    display: flex;
    font-size: 12px;
  }

  .colorcard .colorcard-colorrefs label {
    opacity: 0.87;
  }

  .colorcard .colorcard-colorref_bkg,
  .colorcard .colorcard-colorref_txt {
    width: 100%;
    display: inline-grid;
    grid-template-columns: auto 1fr;
    gap: 4px 16px;
  }

  .colorcard .colorcard-colorref_txt {
    color: var(--bkg);
    margin-left: 16px;
  }

  .colorcard .colorcard-colorref-index,
  .colorcard .colorcard-colorref-hex {
    font-family:
      'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-weight: 700;
  }

  .colorcard .colorcard-divider {
    margin: 16px 0;
    height: 1px;
    background: linear-gradient(to right, var(--txt) 50%, var(--bkg) 50%);
    opacity: 0.32;
  }

  .colorcard .colorcard-wcaglevel {
    display: inline-flex;
    background-color: #fff;
    font-size: 11px;
    border-radius: 8px;
    font-weight: 700;
    padding: 0 4px;
    line-height: 14px;
    white-space: nowrap;
    flex-shrink: 0;
    transition:
      opacity 0.5s cubic-bezier(0.19, 1, 0.22, 1),
      color 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .colorcard .colorcard-wcaglevel svg {
    width: 14px;
    height: 14px;
    position: relative;
  }

  .colorcard .colorcard-wcaglevel_pass {
    color: #115e39;
  }

  .colorcard .colorcard-wcaglevel_fail {
    color: #9f1606;
    opacity: 0.25;
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
    background: linear-gradient(to right, var(--txt) 50%, var(--bkg) 50%);
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .colorcard .colorcard-large_20,
  .colorcard .colorcard-large_14,
  .colorcard .colorcard-regular_16,
  .colorcard .colorcard-regular_12 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .colorcard .colorcard-large_20 {
    font-size: 20pt;
    margin: 0 0 8px;
  }

  .colorcard .colorcard-large_14 {
    font-size: 14pt;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .colorcard .colorcard-icons {
    display: flex;
    column-gap: 12px;
  }

  .colorcard .colorcard-icons_bkg,
  .colorcard .colorcard-icons_txt {
    width: 100%;
    display: inline-flex;
    align-items: center;
    column-gap: 12px;
    flex-wrap: nowrap;
  }

  .colorcard .colorcard-icons svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .colorcard .colorcard-icons_txt {
    color: var(--bkg);
    margin-left: 16px;
  }

  .colorcard .colorcard-regular_16 {
    font-size: 16pt;
    margin: 0 0 8px;
  }

  .colorcard .colorcard-regular_12 {
    font-size: 12pt;
    font-weight: 700;
    margin: 0;
  }
</style>
