<script setup lang="ts">
  import { computed, ref } from 'vue';
  import {
    BellIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    PlusIcon,
    ShieldCheckIcon,
    SunIcon,
  } from '@heroicons/vue/24/outline';
  import { useI18n } from 'vue-i18n';

  import BaseSwitch from '@/components/common/BaseSwitch.vue';
  import type { TonalStep } from '@/utils/tonal/scale';

  const props = defineProps<{
    tones: TonalStep[];
  }>();

  type SurfaceRole =
    | 'surface'
    | 'surface_bright'
    | 'surface_dim'
    | 'container_lowest'
    | 'container_low'
    | 'container'
    | 'container_high'
    | 'container_highest'
    | 'inverse_surface';

  const { t } = useI18n();
  const isDarkMode = ref(false);
  const shellRef = ref<HTMLElement | null>(null);
  const hoveredSurfaceRole = ref<SurfaceRole | null>(null);
  const tooltipPosition = ref({ x: 0, y: 0 });

  const toneAt = (index: number, fallback: string) =>
    props.tones.find((tone) => tone.index === index)?.hex ?? fallback;

  const surfaceTones = computed<Record<SurfaceRole, number>>(() =>
    isDarkMode.value
      ? {
          surface: 6,
          surface_bright: 24,
          surface_dim: 6,
          container_lowest: 4,
          container_low: 10,
          container: 12,
          container_high: 17,
          container_highest: 22,
          inverse_surface: 90,
        }
      : {
          surface: 98,
          surface_bright: 98,
          surface_dim: 87,
          container_lowest: 100,
          container_low: 96,
          container: 94,
          container_high: 92,
          container_highest: 90,
          inverse_surface: 20,
        },
  );

  const surfaceStyles = computed(() => {
    const tones = surfaceTones.value;

    return isDarkMode.value
      ? {
          '--preview-surface': toneAt(tones.surface, '#101010'),
          '--preview-surface-bright': toneAt(tones.surface_bright, '#3d3d3d'),
          '--preview-surface-dim': toneAt(tones.surface_dim, '#101010'),
          '--preview-surface-container-lowest': toneAt(tones.container_lowest, '#0a0a0a'),
          '--preview-surface-container-low': toneAt(tones.container_low, '#1a1a1a'),
          '--preview-surface-container': toneAt(tones.container, '#1f1f1f'),
          '--preview-surface-container-high': toneAt(tones.container_high, '#2b2b2b'),
          '--preview-surface-container-highest': toneAt(tones.container_highest, '#383838'),
          '--preview-inverse-surface': toneAt(tones.inverse_surface, '#e5e5e5'),
          '--preview-on-surface': toneAt(90, '#e5e5e5'),
          '--preview-on-surface-variant': toneAt(80, '#cccccc'),
          '--preview-on-inverse': toneAt(20, '#333333'),
          '--preview-outline': toneAt(60, '#999999'),
          '--preview-primary': toneAt(80, '#cccccc'),
          '--preview-on-primary': toneAt(20, '#333333'),
        }
      : {
          '--preview-surface': toneAt(tones.surface, '#fafafa'),
          '--preview-surface-bright': toneAt(tones.surface_bright, '#fafafa'),
          '--preview-surface-dim': toneAt(tones.surface_dim, '#dedede'),
          '--preview-surface-container-lowest': toneAt(tones.container_lowest, '#ffffff'),
          '--preview-surface-container-low': toneAt(tones.container_low, '#f5f5f5'),
          '--preview-surface-container': toneAt(tones.container, '#f0f0f0'),
          '--preview-surface-container-high': toneAt(tones.container_high, '#ebebeb'),
          '--preview-surface-container-highest': toneAt(tones.container_highest, '#e5e5e5'),
          '--preview-inverse-surface': toneAt(tones.inverse_surface, '#333333'),
          '--preview-on-surface': toneAt(10, '#1a1a1a'),
          '--preview-on-surface-variant': toneAt(35, '#595959'),
          '--preview-on-inverse': toneAt(98, '#fafafa'),
          '--preview-outline': toneAt(70, '#b3b3b3'),
          '--preview-primary': toneAt(40, '#666666'),
          '--preview-on-primary': toneAt(100, '#ffffff'),
        };
  });

  const surfaceTooltip = (role: SurfaceRole) =>
    t('tonal_builder.surface_preview.surface_tooltip', {
      role: t(`tonal_builder.surface_preview.roles.${role}`),
      tone: surfaceTones.value[role],
    });

  const surfaceCards = computed(() => {
    const roles: Array<{ role: SurfaceRole; cssVariable: string }> = [
      { role: 'surface', cssVariable: '--preview-surface' },
      { role: 'surface_bright', cssVariable: '--preview-surface-bright' },
      { role: 'surface_dim', cssVariable: '--preview-surface-dim' },
      { role: 'container_lowest', cssVariable: '--preview-surface-container-lowest' },
      { role: 'container_low', cssVariable: '--preview-surface-container-low' },
      { role: 'container', cssVariable: '--preview-surface-container' },
      { role: 'container_high', cssVariable: '--preview-surface-container-high' },
      { role: 'container_highest', cssVariable: '--preview-surface-container-highest' },
      { role: 'inverse_surface', cssVariable: '--preview-inverse-surface' },
    ];

    return roles.map(({ role, cssVariable }) => {
      const tone = surfaceTones.value[role];

      return {
        role,
        cssVariable,
        tone,
        hex: toneAt(tone, '#000000'),
      };
    });
  });

  const hoveredSurfaceCard = computed(
    () => surfaceCards.value.find((card) => card.role === hoveredSurfaceRole.value) ?? null,
  );

  const surfaceRoleNames: Record<string, SurfaceRole> = {
    surface: 'surface',
    'surface-bright': 'surface_bright',
    'surface-dim': 'surface_dim',
    'surface-container-lowest': 'container_lowest',
    'surface-container-low': 'container_low',
    'surface-container': 'container',
    'surface-container-high': 'container_high',
    'surface-container-highest': 'container_highest',
    'inverse-surface': 'inverse_surface',
  };

  const handleSurfacePointerMove = (event: PointerEvent) => {
    const shell = shellRef.value;
    const target = event.target as Element | null;
    const surface = target?.closest<HTMLElement>('[data-surface-role]');
    if (!shell || !surface || !shell.contains(surface)) {
      hoveredSurfaceRole.value = null;
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    hoveredSurfaceRole.value = surfaceRoleNames[surface.dataset.surfaceRole ?? ''] ?? null;
    tooltipPosition.value = {
      x: Math.min(event.clientX - shellRect.left + 12, shellRect.width - 180),
      y: Math.max(8, event.clientY - shellRect.top - 82),
    };
  };

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
    :style="surfaceStyles"
    :data-theme="isDarkMode ? 'dark' : 'light'"
    :aria-label="t('tonal_builder.surface_preview.title')"
    data-cy="material-surface-preview"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-sm font-semibold text-primary">
        {{ t('tonal_builder.surface_preview.title') }}
      </h2>
      <div class="flex items-center gap-4">
        <span class="hidden text-xs text-secondary sm:inline">
          {{ t('tonal_builder.surface_preview.helper') }}
        </span>
        <BaseSwitch
          id="surface-preview-dark-mode"
          v-model="isDarkMode"
          class="preview-theme-toggle"
          :label="t('tonal_builder.surface_preview.dark_mode')"
          data-cy="surface-preview-dark-mode"
        >
          <template #before>
            <SunIcon aria-hidden="true" />
          </template>
          <template #after>
            <MoonIcon aria-hidden="true" />
          </template>
        </BaseSwitch>
      </div>
    </div>

    <div
      class="preview-surface-cards"
      :aria-label="t('tonal_builder.surface_preview.surface_cards')"
      data-cy="surface-role-cards"
    >
      <article
        v-for="card in surfaceCards"
        :key="card.role"
        class="preview-surface-card"
        :class="{ 'preview-surface-card-inverse': card.role === 'inverse_surface' }"
        :style="{ backgroundColor: `var(${card.cssVariable})` }"
        :data-surface-card="card.role"
      >
        <strong>{{ t(`tonal_builder.surface_preview.roles.${card.role}`) }}</strong>
        <span>
          {{
            t('tonal_builder.surface_preview.tone_value', {
              tone: card.tone,
            })
          }}
          <small>{{ card.hex }}</small>
        </span>
      </article>
    </div>

    <div
      ref="shellRef"
      class="preview-shell"
      :style="surfaceStyles"
      :data-theme="isDarkMode ? 'dark' : 'light'"
      data-cy="surface-preview-shell"
      @pointermove="handleSurfacePointerMove"
      @pointerleave="hoveredSurfaceRole = null"
    >
      <header
        class="preview-topbar"
        data-surface-role="surface-container-low"
        :data-surface-tooltip="surfaceTooltip('container_low')"
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
        data-surface-role="surface-container"
        :data-surface-tooltip="surfaceTooltip('container')"
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
          data-surface-role="surface-dim"
          :data-surface-tooltip="surfaceTooltip('surface_dim')"
        >
          <div class="preview-panel-heading">
            <span>{{ t('tonal_builder.surface_preview.filters.title') }}</span>
            <ChevronDownIcon aria-hidden="true" />
          </div>

          <label>
            <span>{{ t('tonal_builder.surface_preview.filters.search') }}</span>
            <span
              class="preview-input"
              data-surface-role="surface-container-lowest"
              :data-surface-tooltip="surfaceTooltip('container_lowest')"
            >
              <MagnifyingGlassIcon aria-hidden="true" />
              {{ t('tonal_builder.surface_preview.filters.placeholder') }}
            </span>
          </label>

          <div class="preview-filter-grid">
            <label>
              <span>{{ t('tonal_builder.surface_preview.filters.status') }}</span>
              <span
                class="preview-input"
                data-surface-role="surface-container-lowest"
                :data-surface-tooltip="surfaceTooltip('container_lowest')"
                >{{ t('tonal_builder.surface_preview.filters.all') }}</span
              >
            </label>
            <label>
              <span>{{ t('tonal_builder.surface_preview.filters.period') }}</span>
              <span
                class="preview-input"
                data-surface-role="surface-container-lowest"
                :data-surface-tooltip="surfaceTooltip('container_lowest')"
                >{{ t('tonal_builder.surface_preview.filters.month') }}</span
              >
            </label>
          </div>

          <div
            class="preview-summary"
            data-surface-role="surface-container-high"
            :data-surface-tooltip="surfaceTooltip('container_high')"
          >
            <span>{{ t('tonal_builder.surface_preview.summary.label') }}</span>
            <strong>$42,350</strong>
            <small>{{ t('tonal_builder.surface_preview.summary.helper') }}</small>
          </div>
        </aside>

        <main
          class="preview-table-panel"
          data-surface-role="surface"
          :data-surface-tooltip="surfaceTooltip('surface')"
        >
          <div
            class="preview-table-tools"
            data-surface-role="surface-bright"
            :data-surface-tooltip="surfaceTooltip('surface_bright')"
          >
            <strong>{{ t('tonal_builder.surface_preview.table.title') }}</strong>
            <EllipsisVerticalIcon aria-hidden="true" />
          </div>

          <div
            class="preview-table"
            data-surface-role="surface-container-lowest"
            :data-surface-tooltip="surfaceTooltip('container_lowest')"
          >
            <div
              class="preview-table-row preview-table-header"
              data-surface-role="surface-container-low"
              :data-surface-tooltip="surfaceTooltip('container_low')"
            >
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
              :data-surface-role="index === 1 ? 'inverse-surface' : undefined"
              :data-surface-tooltip="index === 1 ? surfaceTooltip('inverse_surface') : undefined"
            >
              <strong>{{ row.code }}</strong>
              <span>{{ row.customer }}</span>
              <span>{{ row.status }}</span>
              <span>{{ row.total }}</span>
            </div>
          </div>

          <div
            class="preview-table-footer"
            data-surface-role="surface-container-low"
            :data-surface-tooltip="surfaceTooltip('container_low')"
          >
            <span>{{ t('tonal_builder.surface_preview.table.showing') }}</span>
            <strong>{{ t('tonal_builder.surface_preview.table.page_total') }} $42,350</strong>
          </div>

          <div
            class="preview-snackbar"
            data-surface-role="inverse-surface"
            :data-surface-tooltip="surfaceTooltip('inverse_surface')"
          >
            <span>{{ t('tonal_builder.surface_preview.activity.approved') }}</span>
          </div>
        </main>

        <aside
          class="preview-inspector"
          data-surface-role="surface-container-highest"
          :data-surface-tooltip="surfaceTooltip('container_highest')"
        >
          <div class="preview-panel-heading">
            <span>{{ t('tonal_builder.surface_preview.details.title') }}</span>
            <EllipsisVerticalIcon aria-hidden="true" />
          </div>

          <section
            class="preview-inspector-card"
            data-surface-role="surface-container-low"
            :data-surface-tooltip="surfaceTooltip('container_low')"
          >
            <div class="preview-customer">
              <span class="preview-avatar">AS</span>
              <div>
                <strong>{{ t('tonal_builder.surface_preview.rows.studio') }}</strong>
                <small>{{ t('tonal_builder.surface_preview.details.customer_since') }}</small>
              </div>
            </div>
            <dl>
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
            class="preview-health-card"
            data-surface-role="surface-container-high"
            :data-surface-tooltip="surfaceTooltip('container_high')"
          >
            <div class="preview-health-heading">
              <ShieldCheckIcon aria-hidden="true" />
              <span>{{ t('tonal_builder.surface_preview.health.title') }}</span>
              <strong>92%</strong>
            </div>
            <div class="preview-health-track">
              <span />
            </div>
            <small>{{ t('tonal_builder.surface_preview.health.helper') }}</small>
          </section>

          <section
            class="preview-activity"
            data-surface-role="surface-container"
            :data-surface-tooltip="surfaceTooltip('container')"
          >
            <div class="preview-panel-heading">
              <span>{{ t('tonal_builder.surface_preview.activity.title') }}</span>
            </div>
            <p>
              <span />
              {{ t('tonal_builder.surface_preview.activity.approved') }}
            </p>
            <p>
              <span />
              {{ t('tonal_builder.surface_preview.activity.sent') }}
            </p>
            <p>
              <span />
              {{ t('tonal_builder.surface_preview.activity.created') }}
            </p>
          </section>
        </aside>
      </div>

      <div
        v-if="hoveredSurfaceCard"
        class="preview-surface-card preview-surface-tooltip"
        :class="{ 'preview-surface-card-inverse': hoveredSurfaceCard.role === 'inverse_surface' }"
        role="tooltip"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          backgroundColor: `var(${hoveredSurfaceCard.cssVariable})`,
        }"
        data-cy="surface-tooltip"
      >
        <strong>{{ t(`tonal_builder.surface_preview.roles.${hoveredSurfaceCard.role}`) }}</strong>
        <span>
          {{
            t('tonal_builder.surface_preview.tone_value', {
              tone: hoveredSurfaceCard.tone,
            })
          }}
          <small>{{ hoveredSurfaceCard.hex }}</small>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .preview-surface-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 6px;
  }

  .preview-surface-card {
    display: grid;
    min-height: 72px;
    align-content: space-between;
    gap: 10px;
    border: 1px solid var(--preview-outline);
    border-radius: 6px;
    padding: 9px;
    color: var(--preview-on-surface);
    box-shadow: 0 2px 6px rgb(0 0 0 / 8%);
  }

  .preview-surface-card strong {
    font-size: 10px;
    line-height: 1.25;
  }

  .preview-surface-card > span {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
    color: var(--preview-on-surface-variant);
    font-size: 9px;
    font-weight: 700;
  }

  .preview-surface-card small {
    font-size: 8px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .preview-surface-card-inverse {
    color: var(--preview-on-inverse);
  }

  .preview-surface-card-inverse > span {
    color: var(--preview-on-inverse);
  }

  .preview-shell {
    position: relative;
    width: 100%;
    height: 470px;
    overflow: hidden;
    border: 1px solid var(--preview-outline);
    border-radius: 6px;
    background: var(--preview-surface-dim);
    color: var(--preview-on-surface);
    box-shadow: 0 12px 32px rgb(0 0 0 / 14%);
    font-size: 11px;
    transition:
      background-color 180ms ease,
      color 180ms ease,
      border-color 180ms ease;
  }

  .preview-surface-tooltip {
    position: absolute;
    z-index: 20;
    width: 168px;
    min-height: 72px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 24%);
    pointer-events: none;
  }

  .preview-theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: rgb(var(--color-text-secondary));
    cursor: pointer;
  }

  .preview-theme-toggle > svg {
    width: 15px;
    height: 15px;
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

  .preview-health-heading svg,
  .preview-input svg,
  .preview-toolbar button svg {
    width: 14px;
    height: 14px;
  }

  .preview-workspace {
    display: grid;
    height: 366px;
    grid-template-columns: minmax(170px, 0.3fr) minmax(280px, 1fr) minmax(190px, 0.34fr);
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
    background: var(--preview-surface-container-lowest);
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
    position: relative;
    min-width: 0;
    background: var(--preview-surface);
  }

  .preview-table-tools {
    height: 40px;
    justify-content: space-between;
    padding: 0 12px;
    background: var(--preview-surface-bright);
    border-bottom: 1px solid var(--preview-outline);
  }

  .preview-table {
    overflow: hidden;
    background: var(--preview-surface-container-lowest);
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

  .preview-table-footer {
    display: flex;
    height: 39px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 10px;
    background: var(--preview-surface-container-low);
    color: var(--preview-on-surface-variant);
    font-size: 9px;
  }

  .preview-table-footer strong {
    color: var(--preview-on-surface);
  }

  .preview-inspector {
    min-width: 0;
    padding: 12px;
    background: var(--preview-surface-container-highest);
  }

  .preview-inspector-card,
  .preview-health-card,
  .preview-activity {
    border-radius: 4px;
    padding: 10px;
  }

  .preview-inspector-card {
    background: var(--preview-surface-container-low);
  }

  .preview-customer {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .preview-customer div {
    display: grid;
    min-width: 0;
    gap: 2px;
  }

  .preview-customer strong,
  .preview-customer small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-customer small {
    color: var(--preview-on-surface-variant);
    font-size: 8px;
  }

  .preview-avatar {
    display: grid;
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 50%;
    background: var(--preview-primary);
    color: var(--preview-on-primary);
    font-size: 9px;
    font-weight: 700;
  }

  .preview-inspector dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 10px 0 0;
  }

  .preview-inspector dl div {
    min-width: 0;
  }

  .preview-inspector dt {
    margin-bottom: 4px;
    color: var(--preview-on-surface-variant);
    font-size: 9px;
  }

  .preview-inspector dd {
    overflow: hidden;
    margin: 0;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-health-card {
    margin-top: 9px;
    background: var(--preview-surface-container-high);
  }

  .preview-health-heading {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 6px;
  }

  .preview-health-heading strong {
    font-size: 13px;
  }

  .preview-health-track {
    height: 4px;
    margin: 8px 0 6px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--preview-surface-container-lowest);
  }

  .preview-health-track span {
    display: block;
    width: 92%;
    height: 100%;
    background: var(--preview-primary);
  }

  .preview-health-card small {
    color: var(--preview-on-surface-variant);
    font-size: 8px;
  }

  .preview-activity {
    margin-top: 9px;
    background: var(--preview-surface-container) !important;
  }

  .preview-activity p {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0;
    border-top: 1px solid var(--preview-outline);
    padding: 7px 0;
    color: var(--preview-on-surface-variant);
  }

  .preview-activity p > span {
    width: 5px;
    height: 5px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--preview-primary);
  }

  .preview-snackbar {
    position: absolute;
    right: 12px;
    bottom: 9px;
    display: flex;
    min-width: 210px;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-radius: 4px;
    padding: 8px 10px;
    background: var(--preview-inverse-surface);
    color: var(--preview-on-inverse);
    box-shadow: 0 6px 16px rgb(0 0 0 / 24%);
  }

  @media (width <= 760px) {
    .preview-nav span:not(.preview-nav-active) {
      display: none;
    }

    .preview-workspace {
      grid-template-columns: minmax(150px, 0.38fr) minmax(0, 1fr) minmax(170px, 0.38fr);
    }

    .preview-table-row {
      grid-template-columns: 0.9fr 1.2fr 0.9fr;
    }

    .preview-table-row > :nth-child(3) {
      display: none;
    }
  }
</style>
