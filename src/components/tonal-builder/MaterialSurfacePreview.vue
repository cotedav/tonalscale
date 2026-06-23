<script setup lang="ts">
  import { computed } from 'vue';
  import {
    BellIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
    MagnifyingGlassIcon,
    PlusIcon,
  } from '@heroicons/vue/24/outline';
  import { useI18n } from 'vue-i18n';

  import type { TonalStep } from '@/utils/tonal/scale';

  const props = defineProps<{
    tones: TonalStep[];
  }>();

  const { t } = useI18n();

  const toneAt = (index: number, fallback: string) =>
    props.tones.find((tone) => tone.index === index)?.hex ?? fallback;

  const surfaceStyles = computed(() => ({
    '--preview-surface': toneAt(98, '#fafafa'),
    '--preview-surface-dim': toneAt(90, '#e5e5e5'),
    '--preview-surface-container-low': toneAt(95, '#f2f2f2'),
    '--preview-surface-container': toneAt(92, '#ebebeb'),
    '--preview-surface-container-high': toneAt(86, '#d9d9d9'),
    '--preview-surface-container-highest': toneAt(80, '#cccccc'),
    '--preview-inverse-surface': toneAt(20, '#333333'),
    '--preview-on-surface': toneAt(10, '#1a1a1a'),
    '--preview-on-surface-variant': toneAt(35, '#595959'),
    '--preview-on-inverse': toneAt(98, '#fafafa'),
    '--preview-outline': toneAt(70, '#b3b3b3'),
    '--preview-primary': toneAt(40, '#666666'),
    '--preview-on-primary': toneAt(100, '#ffffff'),
  }));

  const rows = computed(() => [
    {
      code: 'INV-2048',
      customer: t('tonal_builder.surface_preview.rows.northwind'),
      status: t('tonal_builder.surface_preview.status.review'),
      total: '$12,480',
    },
    {
      code: 'INV-2047',
      customer: t('tonal_builder.surface_preview.rows.studio'),
      status: t('tonal_builder.surface_preview.status.approved'),
      total: '$8,920',
    },
    {
      code: 'INV-2046',
      customer: t('tonal_builder.surface_preview.rows.market'),
      status: t('tonal_builder.surface_preview.status.pending'),
      total: '$4,650',
    },
    {
      code: 'INV-2045',
      customer: t('tonal_builder.surface_preview.rows.foundry'),
      status: t('tonal_builder.surface_preview.status.approved'),
      total: '$16,300',
    },
  ]);
</script>

<template>
  <section
    class="space-y-3"
    :aria-label="t('tonal_builder.surface_preview.title')"
    data-cy="material-surface-preview"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-sm font-semibold text-primary">
        {{ t('tonal_builder.surface_preview.title') }}
      </h2>
      <span class="text-xs text-secondary">
        {{ t('tonal_builder.surface_preview.helper') }}
      </span>
    </div>

    <div
      class="preview-shell"
      :style="surfaceStyles"
      data-cy="surface-preview-shell"
    >
      <header
        class="preview-topbar"
        data-tone="95"
      >
        <div class="preview-brand">
          <span class="preview-brand-mark">TS</span>
          <span>{{ t('tonal_builder.surface_preview.app_name') }}</span>
        </div>

        <nav
          class="preview-nav"
          :aria-label="t('tonal_builder.surface_preview.navigation')"
        >
          <span>{{ t('tonal_builder.surface_preview.nav.dashboard') }}</span>
          <span>{{ t('tonal_builder.surface_preview.nav.orders') }}</span>
          <span class="preview-nav-active">{{
            t('tonal_builder.surface_preview.nav.billing')
          }}</span>
        </nav>

        <div class="preview-profile">
          <BellIcon aria-hidden="true" />
          <span>DC</span>
        </div>
      </header>

      <div
        class="preview-toolbar"
        data-tone="92"
      >
        <div>
          <p class="preview-eyebrow">{{ t('tonal_builder.surface_preview.eyebrow') }}</p>
          <h3>{{ t('tonal_builder.surface_preview.heading') }}</h3>
        </div>
        <button type="button">
          <PlusIcon aria-hidden="true" />
          {{ t('tonal_builder.surface_preview.actions.add') }}
        </button>
      </div>

      <div class="preview-workspace">
        <aside
          class="preview-filters"
          data-tone="90"
        >
          <div class="preview-panel-heading">
            <span>{{ t('tonal_builder.surface_preview.filters.title') }}</span>
            <ChevronDownIcon aria-hidden="true" />
          </div>

          <label>
            <span>{{ t('tonal_builder.surface_preview.filters.search') }}</span>
            <span class="preview-input">
              <MagnifyingGlassIcon aria-hidden="true" />
              {{ t('tonal_builder.surface_preview.filters.placeholder') }}
            </span>
          </label>

          <div class="preview-filter-grid">
            <label>
              <span>{{ t('tonal_builder.surface_preview.filters.status') }}</span>
              <span class="preview-input">{{
                t('tonal_builder.surface_preview.filters.all')
              }}</span>
            </label>
            <label>
              <span>{{ t('tonal_builder.surface_preview.filters.period') }}</span>
              <span class="preview-input">{{
                t('tonal_builder.surface_preview.filters.month')
              }}</span>
            </label>
          </div>

          <div
            class="preview-summary"
            data-tone="86"
          >
            <span>{{ t('tonal_builder.surface_preview.summary.label') }}</span>
            <strong>$42,350</strong>
            <small>{{ t('tonal_builder.surface_preview.summary.helper') }}</small>
          </div>
        </aside>

        <main
          class="preview-table-panel"
          data-tone="98"
        >
          <div class="preview-table-tools">
            <strong>{{ t('tonal_builder.surface_preview.table.title') }}</strong>
            <EllipsisVerticalIcon aria-hidden="true" />
          </div>

          <div class="preview-table">
            <div class="preview-table-row preview-table-header">
              <span>{{ t('tonal_builder.surface_preview.table.invoice') }}</span>
              <span>{{ t('tonal_builder.surface_preview.table.customer') }}</span>
              <span>{{ t('tonal_builder.surface_preview.table.status') }}</span>
              <span>{{ t('tonal_builder.surface_preview.table.total') }}</span>
            </div>
            <div
              v-for="(row, index) in rows"
              :key="row.code"
              class="preview-table-row"
              :class="{ 'preview-table-row-selected': index === 1 }"
            >
              <strong>{{ row.code }}</strong>
              <span>{{ row.customer }}</span>
              <span>{{ row.status }}</span>
              <span>{{ row.total }}</span>
            </div>
          </div>
        </main>
      </div>

      <div
        class="preview-detail-rail"
        data-tone="80"
      >
        <section data-tone="95">
          <div class="preview-panel-heading">
            <span>{{ t('tonal_builder.surface_preview.details.title') }}</span>
            <EllipsisVerticalIcon aria-hidden="true" />
          </div>
          <dl>
            <div>
              <dt>{{ t('tonal_builder.surface_preview.details.customer') }}</dt>
              <dd>{{ t('tonal_builder.surface_preview.rows.studio') }}</dd>
            </div>
            <div>
              <dt>{{ t('tonal_builder.surface_preview.details.due') }}</dt>
              <dd>2026-07-15</dd>
            </div>
            <div>
              <dt>{{ t('tonal_builder.surface_preview.details.owner') }}</dt>
              <dd>D. Cote</dd>
            </div>
          </dl>
        </section>

        <section
          class="preview-activity"
          data-tone="92"
        >
          <div class="preview-panel-heading">
            <span>{{ t('tonal_builder.surface_preview.activity.title') }}</span>
          </div>
          <p>{{ t('tonal_builder.surface_preview.activity.approved') }}</p>
          <p>{{ t('tonal_builder.surface_preview.activity.sent') }}</p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .preview-shell {
    width: 100%;
    height: 470px;
    overflow: hidden;
    border: 1px solid var(--preview-outline);
    border-radius: 6px;
    background: var(--preview-surface-dim);
    color: var(--preview-on-surface);
    box-shadow: 0 12px 32px rgb(0 0 0 / 14%);
    font-size: 11px;
  }

  .preview-topbar,
  .preview-toolbar,
  .preview-panel-heading,
  .preview-profile,
  .preview-brand,
  .preview-nav,
  .preview-table-tools {
    display: flex;
    align-items: center;
  }

  .preview-topbar {
    height: 42px;
    justify-content: space-between;
    gap: 18px;
    padding: 0 14px;
    background: var(--preview-surface-container-low);
    border-bottom: 1px solid var(--preview-outline);
  }

  .preview-brand {
    gap: 8px;
    font-weight: 700;
  }

  .preview-brand-mark {
    display: grid;
    width: 25px;
    height: 25px;
    place-items: center;
    border-radius: 4px;
    background: var(--preview-primary);
    color: var(--preview-on-primary);
    font-size: 9px;
  }

  .preview-nav {
    align-self: stretch;
    gap: 4px;
  }

  .preview-nav span {
    display: grid;
    height: 100%;
    place-items: center;
    padding: 0 12px;
    color: var(--preview-on-surface-variant);
  }

  .preview-nav-active {
    border-bottom: 2px solid var(--preview-primary);
    color: var(--preview-on-surface) !important;
    font-weight: 700;
  }

  .preview-profile {
    gap: 10px;
    font-weight: 700;
  }

  .preview-profile svg,
  .preview-panel-heading svg,
  .preview-table-tools svg {
    width: 15px;
    height: 15px;
  }

  .preview-toolbar {
    height: 62px;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--preview-surface-container);
    border-bottom: 1px solid var(--preview-outline);
  }

  .preview-eyebrow {
    margin: 0 0 2px;
    color: var(--preview-on-surface-variant);
    font-size: 9px;
    text-transform: uppercase;
  }

  .preview-toolbar h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }

  .preview-toolbar button {
    display: inline-flex;
    height: 32px;
    align-items: center;
    gap: 6px;
    border: 0;
    border-radius: 4px;
    padding: 0 12px;
    background: var(--preview-primary);
    color: var(--preview-on-primary);
    font-weight: 700;
  }

  .preview-input svg,
  .preview-toolbar button svg {
    width: 14px;
    height: 14px;
  }

  .preview-workspace {
    display: grid;
    height: 228px;
    grid-template-columns: minmax(180px, 0.34fr) minmax(0, 1fr);
    gap: 1px;
    background: var(--preview-outline);
  }

  .preview-filters {
    padding: 12px;
    background: var(--preview-surface-dim);
  }

  .preview-panel-heading {
    justify-content: space-between;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .preview-filters label {
    display: grid;
    gap: 5px;
    color: var(--preview-on-surface-variant);
    font-weight: 600;
  }

  .preview-input {
    display: flex;
    height: 31px;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--preview-outline);
    border-radius: 4px;
    padding: 0 9px;
    background: var(--preview-surface);
    color: var(--preview-on-surface-variant);
    font-weight: 400;
  }

  .preview-filter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
  }

  .preview-summary {
    display: grid;
    gap: 2px;
    margin-top: 12px;
    border-radius: 4px;
    padding: 10px;
    background: var(--preview-surface-container-high);
  }

  .preview-summary strong {
    font-size: 17px;
  }

  .preview-summary small {
    color: var(--preview-on-surface-variant);
  }

  .preview-table-panel {
    min-width: 0;
    background: var(--preview-surface);
  }

  .preview-table-tools {
    height: 40px;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid var(--preview-outline);
  }

  .preview-table {
    overflow: hidden;
  }

  .preview-table-row {
    display: grid;
    min-height: 36px;
    grid-template-columns: 0.8fr 1.3fr 1fr 0.8fr;
    align-items: center;
    border-bottom: 1px solid var(--preview-outline);
  }

  .preview-table-row > span,
  .preview-table-row > strong {
    min-width: 0;
    overflow: hidden;
    padding: 0 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-table-header {
    min-height: 31px;
    background: var(--preview-surface-container-low);
    color: var(--preview-on-surface-variant);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .preview-table-row-selected {
    background: var(--preview-inverse-surface);
    color: var(--preview-on-inverse);
  }

  .preview-detail-rail {
    display: grid;
    height: 138px;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--preview-surface-container-highest);
    border-top: 1px solid var(--preview-outline);
  }

  .preview-detail-rail section {
    padding: 12px 14px;
    background: var(--preview-surface-container-low);
  }

  .preview-detail-rail dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin: 0;
  }

  .preview-detail-rail dl div {
    min-width: 0;
  }

  .preview-detail-rail dt {
    margin-bottom: 4px;
    color: var(--preview-on-surface-variant);
    font-size: 9px;
  }

  .preview-detail-rail dd {
    overflow: hidden;
    margin: 0;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-activity {
    background: var(--preview-surface-container) !important;
  }

  .preview-activity p {
    margin: 0;
    border-top: 1px solid var(--preview-outline);
    padding: 7px 0;
    color: var(--preview-on-surface-variant);
  }

  @media (width <= 760px) {
    .preview-nav span:not(.preview-nav-active) {
      display: none;
    }

    .preview-workspace {
      grid-template-columns: minmax(160px, 0.4fr) minmax(0, 1fr);
    }

    .preview-table-row {
      grid-template-columns: 0.9fr 1.2fr 0.9fr;
    }

    .preview-table-row > :nth-child(3) {
      display: none;
    }
  }
</style>
