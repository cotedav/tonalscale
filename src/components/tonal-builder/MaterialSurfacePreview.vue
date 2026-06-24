<script setup lang="ts">
  import { computed, ref } from 'vue';
  import {
    ArrowTrendingUpIcon,
    BellIcon,
    ChartBarIcon,
    ChevronDownIcon,
    CreditCardIcon,
    DocumentTextIcon,
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
    | 'inverse_surface'
    | 'on_surface'
    | 'on_surface_variant'
    | 'outline'
    | 'outline_variant';

  type SurfaceContrast = 'low' | 'medium' | 'high';

  const { t } = useI18n();
  const isDarkMode = ref(false);
  const surfaceContrast = ref<SurfaceContrast>('low');
  const shellRef = ref<HTMLElement | null>(null);
  const hoveredSurfaceRole = ref<SurfaceRole | null>(null);
  const tooltipPosition = ref({ x: 0, y: 0 });

  const toneAt = (index: number, fallback: string) =>
    props.tones.find((tone) => tone.index === index)?.hex ?? fallback;

  const surfaceTones = computed<Record<SurfaceRole, number>>(() => {
    const lightMappings: Record<SurfaceContrast, Record<SurfaceRole, number>> = {
      low: {
        surface: 100,
        surface_bright: 100,
        surface_dim: 0,
        container_lowest: 100,
        container_low: 98,
        container: 95,
        container_high: 90,
        container_highest: 80,
        inverse_surface: 20,
        on_surface: 10,
        on_surface_variant: 35,
        outline: 50,
        outline_variant: 80,
      },
      medium: {
        surface: 100,
        surface_bright: 100,
        surface_dim: 0,
        container_lowest: 100,
        container_low: 95,
        container: 90,
        container_high: 80,
        container_highest: 70,
        inverse_surface: 20,
        on_surface: 10,
        on_surface_variant: 35,
        outline: 50,
        outline_variant: 80,
      },
      high: {
        surface: 100,
        surface_bright: 100,
        surface_dim: 0,
        container_lowest: 100,
        container_low: 90,
        container: 80,
        container_high: 60,
        container_highest: 40,
        inverse_surface: 20,
        on_surface: 10,
        on_surface_variant: 35,
        outline: 50,
        outline_variant: 80,
      },
    };
    const darkMappings: Record<SurfaceContrast, Record<SurfaceRole, number>> = {
      low: {
        surface: 0,
        surface_bright: 100,
        surface_dim: 0,
        container_lowest: 0,
        container_low: 10,
        container: 20,
        container_high: 25,
        container_highest: 30,
        inverse_surface: 90,
        on_surface: 90,
        on_surface_variant: 80,
        outline: 60,
        outline_variant: 30,
      },
      medium: {
        surface: 0,
        surface_bright: 100,
        surface_dim: 0,
        container_lowest: 0,
        container_low: 10,
        container: 20,
        container_high: 30,
        container_highest: 40,
        inverse_surface: 90,
        on_surface: 90,
        on_surface_variant: 80,
        outline: 60,
        outline_variant: 30,
      },
      high: {
        surface: 0,
        surface_bright: 100,
        surface_dim: 0,
        container_lowest: 0,
        container_low: 10,
        container: 25,
        container_high: 40,
        container_highest: 60,
        inverse_surface: 90,
        on_surface: 90,
        on_surface_variant: 80,
        outline: 60,
        outline_variant: 30,
      },
    };

    return (isDarkMode.value ? darkMappings : lightMappings)[surfaceContrast.value];
  });

  const contrastLevels: SurfaceContrast[] = ['low', 'medium', 'high'];
  const surfaceContrastIndex = computed(() => contrastLevels.indexOf(surfaceContrast.value));
  const setSurfaceContrast = (event: Event) => {
    const index = Number((event.target as HTMLInputElement).value);
    surfaceContrast.value = contrastLevels[index] ?? 'low';
  };

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
          '--preview-on-surface': toneAt(tones.on_surface, '#e5e5e5'),
          '--preview-on-surface-variant': toneAt(tones.on_surface_variant, '#cccccc'),
          '--preview-on-inverse': toneAt(20, '#333333'),
          '--preview-outline': toneAt(tones.outline, '#999999'),
          '--preview-outline-variant': toneAt(tones.outline_variant, '#4d4d4d'),
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
          '--preview-on-surface': toneAt(tones.on_surface, '#1a1a1a'),
          '--preview-on-surface-variant': toneAt(tones.on_surface_variant, '#595959'),
          '--preview-on-inverse': toneAt(98, '#fafafa'),
          '--preview-outline': toneAt(tones.outline, '#7f7f7f'),
          '--preview-outline-variant': toneAt(tones.outline_variant, '#cccccc'),
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
      { role: 'on_surface', cssVariable: '--preview-on-surface' },
      { role: 'on_surface_variant', cssVariable: '--preview-on-surface-variant' },
      { role: 'outline', cssVariable: '--preview-outline' },
      { role: 'outline_variant', cssVariable: '--preview-outline-variant' },
    ];

    return roles.map(({ role, cssVariable }) => {
      const tone = surfaceTones.value[role];

      return {
        role,
        cssVariable,
        tone,
        hex: toneAt(tone, '#000000'),
        textHex: toneAt(tone >= 60 ? 10 : 90, tone >= 60 ? '#1a1a1a' : '#e5e5e5'),
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
    'on-surface': 'on_surface',
    'on-surface-variant': 'on_surface_variant',
    outline: 'outline',
    'outline-variant': 'outline_variant',
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
    {
      code: 'INV-2044',
      customer: t('tonal_builder.surface_preview.rows.paper'),
      status: t('tonal_builder.surface_preview.status.overdue'),
      total: '$7,240',
    },
    {
      code: 'INV-2043',
      customer: t('tonal_builder.surface_preview.rows.harbor'),
      status: t('tonal_builder.surface_preview.status.draft'),
      total: '$3,880',
    },
  ]);

  const metrics = computed(() => [
    {
      label: t('tonal_builder.surface_preview.metrics.revenue'),
      value: '$184,320',
      helper: t('tonal_builder.surface_preview.metrics.revenue_helper'),
      icon: ChartBarIcon,
      role: 'container_low' as SurfaceRole,
    },
    {
      label: t('tonal_builder.surface_preview.metrics.outstanding'),
      value: '$42,350',
      helper: t('tonal_builder.surface_preview.metrics.outstanding_helper'),
      icon: DocumentTextIcon,
      role: 'container' as SurfaceRole,
    },
    {
      label: t('tonal_builder.surface_preview.metrics.paid'),
      value: '86%',
      helper: t('tonal_builder.surface_preview.metrics.paid_helper'),
      icon: CreditCardIcon,
      role: 'container_high' as SurfaceRole,
    },
    {
      label: t('tonal_builder.surface_preview.metrics.growth'),
      value: '+12.4%',
      helper: t('tonal_builder.surface_preview.metrics.growth_helper'),
      icon: ArrowTrendingUpIcon,
      role: 'container_highest' as SurfaceRole,
    },
  ]);
</script>

<template>
  <section
    class="material-surface-preview space-y-3"
    :style="surfaceStyles"
    :data-theme="isDarkMode ? 'dark' : 'light'"
    :aria-label="t('tonal_builder.surface_preview.title')"
    data-cy="material-surface-preview"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-sm font-semibold text-primary">
        {{ t('tonal_builder.surface_preview.title') }}
      </h2>
      <span class="hidden text-xs text-secondary sm:inline">
        {{ t('tonal_builder.surface_preview.helper') }}
      </span>
    </div>

    <div class="preview-controls-toolbar">
      <div
        class="preview-contrast-control"
        data-cy="surface-contrast-control"
      >
        <div class="preview-contrast-heading">
          <label for="surface-contrast-slider">
            {{ t('tonal_builder.surface_preview.contrast.label') }}
          </label>
          <strong data-cy="surface-contrast-value">
            {{ t(`tonal_builder.surface_preview.contrast.${surfaceContrast}`) }}
          </strong>
        </div>
        <input
          id="surface-contrast-slider"
          type="range"
          min="0"
          max="2"
          step="1"
          :value="surfaceContrastIndex"
          :aria-valuetext="t(`tonal_builder.surface_preview.contrast.${surfaceContrast}`)"
          data-cy="surface-contrast-slider"
          @input="setSurfaceContrast"
        />
        <div class="preview-contrast-levels">
          <span
            v-for="(level, index) in contrastLevels"
            :key="level"
            :class="{
              'preview-contrast-active': surfaceContrast === level,
              'preview-contrast-level-center': index === 1,
              'preview-contrast-level-end': index === 2,
            }"
          >
            {{ t(`tonal_builder.surface_preview.contrast.${level}`) }}
          </span>
        </div>
      </div>

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

    <div
      class="preview-surface-cards"
      :aria-label="t('tonal_builder.surface_preview.surface_cards')"
      data-cy="surface-role-cards"
    >
      <article
        v-for="card in surfaceCards"
        :key="card.role"
        class="preview-surface-card"
        :style="{
          backgroundColor: `var(${card.cssVariable})`,
          '--preview-card-text': card.textHex,
        }"
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
          <span
            data-surface-role="on-surface"
            :data-surface-tooltip="surfaceTooltip('on_surface')"
            >{{ t('tonal_builder.surface_preview.app_name') }}</span
          >
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
          <p
            class="preview-eyebrow"
            data-surface-role="on-surface-variant"
            :data-surface-tooltip="surfaceTooltip('on_surface_variant')"
          >
            {{ t('tonal_builder.surface_preview.eyebrow') }}
          </p>
          <h3
            data-surface-role="on-surface"
            :data-surface-tooltip="surfaceTooltip('on_surface')"
          >
            {{ t('tonal_builder.surface_preview.heading') }}
          </h3>
        </div>
        <button type="button">
          <PlusIcon aria-hidden="true" />
          {{ t('tonal_builder.surface_preview.actions.add') }}
        </button>
      </div>

      <section class="preview-metrics">
        <article
          v-for="metric in metrics"
          :key="metric.label"
          class="preview-metric"
          :class="`preview-metric-${metric.role}`"
          :data-surface-role="`surface-${metric.role.replaceAll('_', '-')}`"
          :data-surface-tooltip="surfaceTooltip(metric.role)"
        >
          <div>
            <span
              data-surface-role="on-surface-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_variant')"
              >{{ metric.label }}</span
            >
            <strong
              data-surface-role="on-surface"
              :data-surface-tooltip="surfaceTooltip('on_surface')"
              >{{ metric.value }}</strong
            >
            <small
              data-surface-role="on-surface-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_variant')"
              >{{ metric.helper }}</small
            >
          </div>
          <component
            :is="metric.icon"
            aria-hidden="true"
          />
        </article>
      </section>

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
              data-surface-role="outline"
              :data-surface-tooltip="surfaceTooltip('outline')"
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
                data-surface-role="outline"
                :data-surface-tooltip="surfaceTooltip('outline')"
                >{{ t('tonal_builder.surface_preview.filters.all') }}</span
              >
            </label>
            <label>
              <span>{{ t('tonal_builder.surface_preview.filters.period') }}</span>
              <span
                class="preview-input"
                data-surface-role="outline"
                :data-surface-tooltip="surfaceTooltip('outline')"
                >{{ t('tonal_builder.surface_preview.filters.month') }}</span
              >
            </label>
          </div>

          <div class="preview-filter-section">
            <span>{{ t('tonal_builder.surface_preview.filters.saved_view') }}</span>
            <button
              type="button"
              data-surface-role="outline"
              :data-surface-tooltip="surfaceTooltip('outline')"
            >
              {{ t('tonal_builder.surface_preview.filters.collection') }}
              <ChevronDownIcon aria-hidden="true" />
            </button>
          </div>

          <div class="preview-filter-section">
            <span>{{ t('tonal_builder.surface_preview.filters.active') }}</span>
            <div class="preview-filter-chips">
              <span>{{ t('tonal_builder.surface_preview.status.review') }}</span>
              <span>{{ t('tonal_builder.surface_preview.filters.high_value') }}</span>
            </div>
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

          <section
            class="preview-collection-health"
            data-surface-role="surface-container"
            :data-surface-tooltip="surfaceTooltip('container')"
          >
            <div class="preview-panel-heading">
              <span>{{ t('tonal_builder.surface_preview.collection_health.title') }}</span>
              <strong>74%</strong>
            </div>
            <div class="preview-collection-track">
              <span />
            </div>
            <div
              class="preview-collection-stat preview-collection-stat-lowest"
              data-surface-role="surface-container-lowest"
              :data-surface-tooltip="surfaceTooltip('container_lowest')"
            >
              <span>{{ t('tonal_builder.surface_preview.collection_health.follow_up') }}</span>
              <strong>8</strong>
            </div>
            <div
              class="preview-collection-stat preview-collection-stat-highest"
              data-surface-role="surface-container-highest"
              :data-surface-tooltip="surfaceTooltip('container_highest')"
            >
              <span>{{ t('tonal_builder.surface_preview.collection_health.at_risk') }}</span>
              <strong>$18,240</strong>
            </div>
          </section>
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
            <div>
              <strong
                data-surface-role="on-surface"
                :data-surface-tooltip="surfaceTooltip('on_surface')"
                >{{ t('tonal_builder.surface_preview.table.title') }}</strong
              >
              <span
                data-surface-role="on-surface-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_variant')"
                >{{ t('tonal_builder.surface_preview.table.updated') }}</span
              >
            </div>
            <div
              class="preview-table-actions"
              data-surface-role="outline"
              :data-surface-tooltip="surfaceTooltip('outline')"
            >
              <span>{{ t('tonal_builder.surface_preview.table.view') }}</span>
              <EllipsisVerticalIcon aria-hidden="true" />
            </div>
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
              <span
                data-surface-role="outline-variant"
                :data-surface-tooltip="surfaceTooltip('outline_variant')"
                >{{ t('tonal_builder.surface_preview.table.invoice') }}</span
              >
              <span
                data-surface-role="outline-variant"
                :data-surface-tooltip="surfaceTooltip('outline_variant')"
                >{{ t('tonal_builder.surface_preview.table.customer') }}</span
              >
              <span
                data-surface-role="outline-variant"
                :data-surface-tooltip="surfaceTooltip('outline_variant')"
                >{{ t('tonal_builder.surface_preview.table.status') }}</span
              >
              <span
                data-surface-role="outline-variant"
                :data-surface-tooltip="surfaceTooltip('outline_variant')"
                >{{ t('tonal_builder.surface_preview.table.total') }}</span
              >
            </div>
            <div
              v-for="(row, index) in rows"
              :key="row.code"
              class="preview-table-row"
              :class="{ 'preview-table-row-selected': index === 1 }"
              :data-surface-role="index === 1 ? 'inverse-surface' : undefined"
              :data-surface-tooltip="index === 1 ? surfaceTooltip('inverse_surface') : undefined"
            >
              <strong
                :data-surface-role="index === 1 ? undefined : 'on-surface'"
                :data-surface-tooltip="index === 1 ? undefined : surfaceTooltip('on_surface')"
                >{{ row.code }}</strong
              >
              <span
                :data-surface-role="index === 1 ? undefined : 'on-surface'"
                :data-surface-tooltip="index === 1 ? undefined : surfaceTooltip('on_surface')"
                >{{ row.customer }}</span
              >
              <span
                :data-surface-role="index === 1 ? undefined : 'on-surface-variant'"
                :data-surface-tooltip="
                  index === 1 ? undefined : surfaceTooltip('on_surface_variant')
                "
                >{{ row.status }}</span
              >
              <span
                :data-surface-role="index === 1 ? undefined : 'on-surface'"
                :data-surface-tooltip="index === 1 ? undefined : surfaceTooltip('on_surface')"
                >{{ row.total }}</span
              >
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

          <div class="preview-table-dashboard">
            <section
              class="preview-reconciliation"
              data-surface-role="surface-container"
              :data-surface-tooltip="surfaceTooltip('container')"
            >
              <div class="preview-panel-heading">
                <div class="preview-panel-title">
                  <strong>{{ t('tonal_builder.surface_preview.reconciliation.title') }}</strong>
                  <small>{{ t('tonal_builder.surface_preview.reconciliation.helper') }}</small>
                </div>
                <span class="preview-reconciliation-badge">{{
                  t('tonal_builder.surface_preview.reconciliation.open')
                }}</span>
              </div>
              <div
                class="preview-reconciliation-item preview-reconciliation-item-lowest"
                data-surface-role="surface-container-lowest"
                :data-surface-tooltip="surfaceTooltip('container_lowest')"
              >
                <span class="preview-reconciliation-icon">
                  <CreditCardIcon
                    class="preview-reconciliation-icon-svg"
                    aria-hidden="true"
                  />
                </span>
                <div class="preview-reconciliation-copy">
                  <strong>{{ t('tonal_builder.surface_preview.reconciliation.gateway') }}</strong>
                  <small>{{
                    t('tonal_builder.surface_preview.reconciliation.gateway_helper')
                  }}</small>
                </div>
                <strong>$6,240</strong>
              </div>
              <div
                class="preview-reconciliation-item preview-reconciliation-item-high"
                data-surface-role="surface-container-high"
                :data-surface-tooltip="surfaceTooltip('container_high')"
              >
                <span class="preview-reconciliation-icon">
                  <DocumentTextIcon
                    class="preview-reconciliation-icon-svg"
                    aria-hidden="true"
                  />
                </span>
                <div class="preview-reconciliation-copy">
                  <strong>{{ t('tonal_builder.surface_preview.reconciliation.credit') }}</strong>
                  <small>{{
                    t('tonal_builder.surface_preview.reconciliation.credit_helper')
                  }}</small>
                </div>
                <strong>$1,890</strong>
              </div>
            </section>

            <section
              class="preview-settlement"
              data-surface-role="surface-bright"
              :data-surface-tooltip="surfaceTooltip('surface_bright')"
            >
              <div class="preview-panel-heading">
                <div class="preview-panel-title">
                  <strong>{{ t('tonal_builder.surface_preview.settlement.title') }}</strong>
                  <small>{{ t('tonal_builder.surface_preview.settlement.helper') }}</small>
                </div>
                <strong>$31,860</strong>
              </div>
              <div class="preview-settlement-chart">
                <span class="preview-settlement-bar preview-settlement-bar-1" />
                <span class="preview-settlement-bar preview-settlement-bar-2" />
                <span class="preview-settlement-bar preview-settlement-bar-3" />
                <span class="preview-settlement-bar preview-settlement-bar-4" />
                <span class="preview-settlement-bar preview-settlement-bar-5" />
                <span class="preview-settlement-bar preview-settlement-bar-6" />
              </div>
              <div
                class="preview-settlement-total"
                data-surface-role="surface-container-low"
                :data-surface-tooltip="surfaceTooltip('container_low')"
              >
                <span>{{ t('tonal_builder.surface_preview.settlement.next') }}</span>
                <strong>{{ t('tonal_builder.surface_preview.settlement.tomorrow') }}</strong>
              </div>
            </section>
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
            class="preview-payment-card"
            data-surface-role="surface-container-lowest"
            :data-surface-tooltip="surfaceTooltip('container_lowest')"
          >
            <div class="preview-panel-heading">
              <span>{{ t('tonal_builder.surface_preview.payment.title') }}</span>
              <strong>$8,920</strong>
            </div>
            <dl>
              <div>
                <dt>{{ t('tonal_builder.surface_preview.payment.method') }}</dt>
                <dd>•••• 4832</dd>
              </div>
              <div>
                <dt>{{ t('tonal_builder.surface_preview.payment.terms') }}</dt>
                <dd>Net 30</dd>
              </div>
            </dl>
          </section>

          <section
            class="preview-note"
            data-surface-role="surface-bright"
            :data-surface-tooltip="surfaceTooltip('surface_bright')"
          >
            <strong>{{ t('tonal_builder.surface_preview.note.title') }}</strong>
            <p>{{ t('tonal_builder.surface_preview.note.body') }}</p>
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
            <p>
              <span />
              {{ t('tonal_builder.surface_preview.activity.viewed') }}
            </p>
          </section>
        </aside>
      </div>

      <div
        v-if="hoveredSurfaceCard"
        class="preview-surface-card preview-surface-tooltip"
        role="tooltip"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          backgroundColor: `var(${hoveredSurfaceCard.cssVariable})`,
          '--preview-card-text': hoveredSurfaceCard.textHex,
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
  .material-surface-preview {
    container-type: inline-size;
  }

  .preview-controls-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
    width: 100%;
  }

  .preview-contrast-control {
    display: grid;
    flex: 0 1 320px;
    gap: 8px;
    width: min(320px, 100%);
    color: rgb(var(--color-text-secondary));
    font-size: 12px;
    font-weight: 600;
  }

  .preview-contrast-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .preview-contrast-heading label {
    color: rgb(var(--color-text-primary));
  }

  .preview-contrast-heading strong {
    color: rgb(var(--color-accent));
    font-size: 12px;
    font-weight: 700;
  }

  .preview-contrast-control input {
    width: 100%;
    height: 6px;
    margin: 5px 0 0;
    cursor: pointer;
    appearance: none;
    border-radius: 999px;
    background: rgb(var(--color-border-highlight));
    accent-color: rgb(var(--color-accent-strong));
  }

  .preview-contrast-control input::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
    appearance: none;
    border: 3px solid rgb(var(--color-surface));
    border-radius: 50%;
    background: rgb(var(--color-accent-strong));
    box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
  }

  .preview-contrast-control input::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 3px solid rgb(var(--color-surface));
    border-radius: 50%;
    background: rgb(var(--color-accent-strong));
    box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
  }

  .preview-contrast-control input:focus-visible {
    outline: 2px solid rgb(var(--color-accent));
    outline-offset: 5px;
  }

  .preview-contrast-levels {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 10px;
  }

  .preview-contrast-level-center {
    text-align: center;
  }

  .preview-contrast-level-end {
    text-align: right;
  }

  .preview-contrast-levels .preview-contrast-active {
    color: rgb(var(--color-accent));
    font-weight: 700;
  }

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
    color: var(--preview-card-text);
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
    color: var(--preview-card-text);
    font-size: 9px;
    font-weight: 700;
  }

  .preview-surface-card small {
    font-size: 8px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .preview-shell {
    position: relative;
    width: 100%;
    min-height: 0;
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
    flex: none;
    align-items: center;
    gap: 7px;
    color: rgb(var(--color-text-secondary));
    cursor: pointer;
  }

  .preview-theme-toggle > svg {
    width: 15px;
    height: 15px;
  }

  @media (width <= 520px) {
    .preview-controls-toolbar {
      align-items: flex-end;
      gap: 12px;
      width: 100%;
    }

    .preview-contrast-control {
      min-width: 0;
    }
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
    border-bottom: 1px solid var(--preview-outline-variant);
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
    height: 66px;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--preview-surface-container);
    border-bottom: 1px solid var(--preview-outline-variant);
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

  .preview-metric svg {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    color: var(--preview-primary);
  }

  .preview-health-heading svg,
  .preview-input svg,
  .preview-toolbar button svg {
    width: 14px;
    height: 14px;
  }

  .preview-metrics {
    display: grid;
    height: 104px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    background: var(--preview-outline-variant);
    border-bottom: 1px solid var(--preview-outline-variant);
  }

  .preview-metric {
    display: flex;
    min-width: 0;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
  }

  .preview-metric > div {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .preview-metric span,
  .preview-metric small {
    overflow: hidden;
    color: var(--preview-on-surface-variant);
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-metric strong {
    font-size: 18px;
  }

  .preview-metric-container_low {
    background: var(--preview-surface-container-low);
  }

  .preview-metric-container {
    background: var(--preview-surface-container);
  }

  .preview-metric-container_high {
    background: var(--preview-surface-container-high);
  }

  .preview-metric-container_highest {
    background: var(--preview-surface-container-highest);
  }

  .preview-workspace {
    display: grid;
    min-height: 760px;
    grid-template-columns: minmax(180px, 0.27fr) minmax(360px, 1fr) minmax(220px, 0.34fr);
    gap: 1px;
    background: var(--preview-outline-variant);
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

  .preview-filter-section {
    display: grid;
    gap: 6px;
    margin-top: 13px;
    color: var(--preview-on-surface-variant);
    font-weight: 600;
  }

  .preview-filter-section button {
    display: flex;
    height: 31px;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--preview-outline);
    border-radius: 4px;
    padding: 0 9px;
    background: var(--preview-surface-container-lowest);
    color: var(--preview-on-surface);
  }

  .preview-filter-section button svg {
    width: 13px;
    height: 13px;
  }

  .preview-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .preview-filter-chips span {
    border: 1px solid var(--preview-outline);
    border-radius: 999px;
    padding: 4px 7px;
    background: var(--preview-surface-container-low);
    color: var(--preview-on-surface);
    font-size: 8px;
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

  .preview-collection-health {
    display: grid;
    min-height: 220px;
    align-content: start;
    gap: 8px;
    margin-top: 12px;
    border-radius: 4px;
    padding: 10px;
    background: var(--preview-surface-container);
  }

  .preview-collection-health .preview-panel-heading {
    margin-bottom: 0;
  }

  .preview-collection-track {
    height: 5px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--preview-surface-container-lowest);
  }

  .preview-collection-track span {
    display: block;
    width: 74%;
    height: 100%;
    background: var(--preview-primary);
  }

  .preview-collection-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-radius: 4px;
    padding: 8px;
  }

  .preview-collection-stat-lowest {
    background: var(--preview-surface-container-lowest);
  }

  .preview-collection-stat-highest {
    background: var(--preview-surface-container-highest);
  }

  .preview-table-panel {
    position: relative;
    min-width: 0;
    background: var(--preview-surface);
  }

  .preview-table-tools {
    height: 48px;
    justify-content: space-between;
    padding: 0 12px;
    background: var(--preview-surface-bright);
    border-bottom: 1px solid var(--preview-outline-variant);
  }

  .preview-table-tools > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .preview-table-tools span {
    color: var(--preview-on-surface-variant);
    font-size: 8px;
  }

  .preview-table-actions {
    border: 1px solid var(--preview-outline);
    border-radius: 4px;
    padding: 5px 7px;
  }

  .preview-table {
    overflow: hidden;
    background: var(--preview-surface-container-lowest);
  }

  .preview-table-row {
    display: grid;
    min-height: 39px;
    grid-template-columns: 0.8fr 1.3fr 1fr 0.8fr;
    align-items: center;
    border-bottom: 1px solid var(--preview-outline-variant);
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
    height: 43px;
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

  .preview-table-dashboard {
    display: grid;
    min-height: 390px;
    grid-template-columns: minmax(0, 1.25fr) minmax(180px, 0.75fr);
    gap: 10px;
    padding: 12px;
  }

  .preview-reconciliation,
  .preview-settlement {
    border-radius: 4px;
    padding: 12px;
  }

  .preview-reconciliation {
    background: var(--preview-surface-container);
  }

  .preview-settlement {
    background: var(--preview-surface-bright);
  }

  .preview-reconciliation .preview-panel-heading,
  .preview-settlement .preview-panel-heading {
    margin-bottom: 10px;
  }

  .preview-panel-title {
    display: grid;
    gap: 2px;
  }

  .preview-reconciliation small,
  .preview-settlement small {
    color: var(--preview-on-surface-variant);
    font-size: 8px;
    font-weight: 400;
  }

  .preview-reconciliation-badge {
    border-radius: 999px;
    padding: 4px 7px;
    background: var(--preview-surface-container-highest);
    font-size: 8px;
  }

  .preview-reconciliation-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    margin-top: 7px;
    border-radius: 4px;
    padding: 10px;
  }

  .preview-reconciliation-item-lowest {
    background: var(--preview-surface-container-lowest);
  }

  .preview-reconciliation-item-high {
    background: var(--preview-surface-container-high);
  }

  .preview-reconciliation-copy {
    display: grid;
    min-width: 0;
    gap: 2px;
  }

  .preview-reconciliation-icon {
    display: grid;
    width: 28px;
    height: 28px;
    place-items: center;
    border-radius: 4px;
    background: var(--preview-surface-container-highest);
    color: var(--preview-primary);
  }

  .preview-reconciliation-icon-svg {
    width: 15px;
    height: 15px;
  }

  .preview-settlement-chart {
    display: flex;
    height: 180px;
    align-items: flex-end;
    gap: 6px;
    border-bottom: 1px solid var(--preview-outline-variant);
    padding: 6px 4px 0;
  }

  .preview-settlement-bar {
    flex: 1;
    border-radius: 3px 3px 0 0;
    background: var(--preview-primary);
  }

  .preview-settlement-bar-1 {
    height: 42%;
  }

  .preview-settlement-bar-2 {
    height: 66%;
  }

  .preview-settlement-bar-3 {
    height: 54%;
  }

  .preview-settlement-bar-4 {
    height: 82%;
  }

  .preview-settlement-bar-5 {
    height: 70%;
  }

  .preview-settlement-bar-6 {
    height: 94%;
  }

  .preview-settlement-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 9px;
    border-radius: 4px;
    padding: 8px;
    background: var(--preview-surface-container-low);
  }

  .preview-inspector {
    min-width: 0;
    padding: 12px;
    background: var(--preview-surface-container-highest);
  }

  .preview-inspector-card,
  .preview-health-card,
  .preview-note,
  .preview-payment-card,
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

  .preview-payment-card {
    margin-top: 9px;
    background: var(--preview-surface-container-lowest);
  }

  .preview-payment-card .preview-panel-heading {
    margin-bottom: 8px;
  }

  .preview-payment-card dl {
    margin-top: 0;
  }

  .preview-note {
    margin-top: 9px;
    background: var(--preview-surface-bright);
  }

  .preview-note p {
    margin: 5px 0 0;
    color: var(--preview-on-surface-variant);
    font-size: 9px;
    line-height: 1.4;
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
    border-top: 1px solid var(--preview-outline-variant);
    padding: 6px 0;
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

  @container (width <= 760px) {
    .preview-nav span:not(.preview-nav-active) {
      display: none;
    }

    .preview-workspace {
      min-height: 0;
      grid-template-columns: minmax(150px, 0.38fr) minmax(0, 1fr);
    }

    .preview-metrics {
      height: auto;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .preview-metric {
      min-height: 92px;
    }

    .preview-inspector {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 9px;
    }

    .preview-inspector > .preview-panel-heading {
      grid-column: 1 / -1;
      margin-bottom: 0;
    }

    .preview-health-card,
    .preview-payment-card,
    .preview-note,
    .preview-activity {
      margin-top: 0;
    }

    .preview-table-row {
      grid-template-columns: 0.9fr 1.2fr 0.9fr;
    }

    .preview-table-row > :nth-child(3) {
      display: none;
    }

    .preview-table-dashboard {
      min-height: 0;
      grid-template-columns: 1fr;
    }
  }

  @container (width <= 520px) {
    .preview-topbar {
      gap: 8px;
    }

    .preview-nav {
      display: none;
    }

    .preview-toolbar {
      height: auto;
      min-height: 66px;
      gap: 12px;
      padding-block: 10px;
    }

    .preview-workspace {
      grid-template-columns: 1fr;
    }

    .preview-inspector {
      grid-column: auto;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .preview-inspector > .preview-panel-heading {
      grid-column: 1 / -1;
    }

    .preview-snackbar {
      right: 8px;
      bottom: 8px;
      min-width: 0;
      max-width: calc(100% - 16px);
    }
  }
</style>
