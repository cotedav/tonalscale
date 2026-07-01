<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useEventListener } from '@vueuse/core';
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
    ArrowPathIcon,
    ShieldCheckIcon,
    SunIcon,
    ExclamationTriangleIcon,
  } from '@heroicons/vue/24/outline';
  import { useI18n } from 'vue-i18n';

  import BaseSwitch from '@/components/common/BaseSwitch.vue';
  import type { SurfaceContrast, TonalColorRole } from '@/stores/tonalScale';
  import type { TonalStep } from '@/utils/tonal/scale';
  import {
    buildAccentSurfaceRoleTones,
    buildSurfaceRoleTones,
    type SurfaceToneRole,
  } from '@/utils/tonal/surface-roles';

  type MaterialPreviewRolePalette = {
    role: TonalColorRole;
    label: string;
    kind?: 'surface' | 'accent' | 'custom';
    baseTone?: number;
    excludedTone?: number | null;
    tones: TonalStep[];
    surfaceTones?: TonalStep[];
  };
  type SurfaceToneOverrides = Partial<Record<SurfaceToneRole, number>>;
  type RoleSurfaceToneOverrides = {
    light: SurfaceToneOverrides;
    dark: SurfaceToneOverrides;
  };

  const props = withDefaults(
    defineProps<{
      tones: TonalStep[];
      primaryTones?: TonalStep[];
      rolePalettes?: MaterialPreviewRolePalette[];
      activeRole?: TonalColorRole;
      surfaceContrastSettings?: Record<TonalColorRole, SurfaceContrast>;
      lightSurfaceToneSettings?: Record<TonalColorRole, number>;
      darkSurfaceToneSettings?: Record<TonalColorRole, number>;
      surfaceToneCustomizations?: Record<TonalColorRole, RoleSurfaceToneOverrides>;
    }>(),
    {
      primaryTones: undefined,
      rolePalettes: () => [],
      activeRole: 'surface',
      surfaceContrastSettings: () => ({ surface: 'low', primary: 'low' }),
      lightSurfaceToneSettings: () => ({ surface: 100, primary: 50 }),
      darkSurfaceToneSettings: () => ({ surface: 0, primary: 50 }),
      surfaceToneCustomizations: () => ({}),
    },
  );

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
    | 'inverse_on_surface'
    | 'on_surface'
    | 'on_surface_variant'
    | 'on_surface_container'
    | 'on_surface_container_variant'
    | 'outline'
    | 'outline_variant';
  type SurfaceCard = {
    role: SurfaceRole;
    cssVariable: string;
    tone: number;
    hex: string;
    textHex: string;
    label: string;
    palette: TonalColorRole;
  };
  const { t } = useI18n();
  const isDarkMode = defineModel<boolean>('darkMode', { default: false });
  const surfaceContrast = defineModel<SurfaceContrast>('surfaceContrast', { default: 'low' });
  const lightSurfaceTone = defineModel<number>('lightSurfaceTone', { default: 100 });
  const darkSurfaceTone = defineModel<number>('darkSurfaceTone', { default: 0 });
  const lightCustomSurfaceTones = defineModel<SurfaceToneOverrides>('lightCustomSurfaceTones', {
    default: () => ({}),
  });
  const darkCustomSurfaceTones = defineModel<SurfaceToneOverrides>('darkCustomSurfaceTones', {
    default: () => ({}),
  });
  const shellRef = ref<HTMLElement | null>(null);
  const surfaceCardsRef = ref<HTMLElement | null>(null);
  const hoveredSurfaceRole = ref<SurfaceRole | null>(null);
  const hoveredPalette = ref<TonalColorRole>('surface');
  const selectedSurfaceCardRole = ref<SurfaceRole | null>(null);
  const tooltipPosition = ref({ x: 0, y: 0 });

  const rolePalettes = computed<MaterialPreviewRolePalette[]>(() => {
    if (props.rolePalettes.length) return props.rolePalettes;

    return [
      {
        role: 'surface',
        label: t('tonal_builder.roles.surface'),
        kind: 'surface',
        baseTone: 100,
        tones: props.tones,
      },
      {
        role: 'primary',
        label: t('tonal_builder.roles.primary'),
        kind: 'accent',
        baseTone: 50,
        tones: props.primaryTones ?? props.tones,
      },
    ];
  });
  const findPalette = (palette: TonalColorRole) =>
    rolePalettes.value.find((rolePalette) => rolePalette.role === palette);
  const paletteFor = (palette: TonalColorRole) =>
    findPalette(palette) ??
    rolePalettes.value[0] ?? {
      role: 'surface',
      label: t('tonal_builder.roles.surface'),
      kind: 'surface',
      baseTone: 100,
      tones: props.tones,
    };
  const hasPalette = (palette: TonalColorRole) => Boolean(findPalette(palette));
  const showcasePalettes = computed(() =>
    rolePalettes.value.filter((rolePalette) => rolePalette.role !== 'surface'),
  );
  const secondaryPalette = computed(() => findPalette('secondary'));
  const tertiaryPalette = computed(() => findPalette('tertiary'));
  const errorPalette = computed(() => findPalette('error'));
  const surfaceToneSourceFor = (palette: MaterialPreviewRolePalette) =>
    palette.surfaceTones ?? palette.tones;
  const fullToneSourceFor = (palette: MaterialPreviewRolePalette) => palette.tones;
  const activeTones = computed(() => surfaceToneSourceFor(paletteFor(props.activeRole)));
  const availableToneIndices = computed(() =>
    [...new Set(activeTones.value.map((tone) => tone.index))].sort((left, right) => left - right),
  );
  const isActiveSurfaceRole = computed(() => paletteFor(props.activeRole).kind === 'surface');
  const isSelectableSurfaceTone = (tone: number) => {
    if (!isActiveSurfaceRole.value) return tone >= 5 && tone <= 99;
    if (isDarkMode.value) return tone >= 0 && tone <= 25;
    return tone >= 80 && tone <= 100;
  };
  const selectableSurfaceToneIndices = computed(() =>
    availableToneIndices.value.filter((tone) => isSelectableSurfaceTone(tone)),
  );
  const nearestAvailableCustomTone = (tone: number, palette: MaterialPreviewRolePalette) => {
    const indices = [...new Set(fullToneSourceFor(palette).map((step) => step.index))].sort(
      (left, right) => left - right,
    );
    if (!indices.length) return tone;

    return indices.reduce((nearest, index) =>
      Math.abs(index - tone) < Math.abs(nearest - tone) ? index : nearest,
    );
  };

  const toneAt = (index: number, fallback: string, palette: TonalColorRole = 'surface') =>
    fullToneSourceFor(paletteFor(palette)).find((tone) => tone.index === index)?.hex ?? fallback;

  const activeRoleBaseTone = computed(() => paletteFor(props.activeRole).baseTone ?? 100);
  const activeSurfaceTone = computed(() => {
    const themeTone = isDarkMode.value ? darkSurfaceTone.value : lightSurfaceTone.value;
    return selectableSurfaceToneIndices.value.includes(themeTone)
      ? themeTone
      : activeRoleBaseTone.value;
  });
  const activeSurfaceToneIndex = computed(() =>
    Math.max(0, selectableSurfaceToneIndices.value.indexOf(activeSurfaceTone.value)),
  );
  const setSurfaceTone = (event: Event) => {
    const index = Number((event.target as HTMLInputElement).value);
    const tone = selectableSurfaceToneIndices.value[index];

    if (tone === undefined) return;

    if (isDarkMode.value) {
      darkSurfaceTone.value = tone;
    } else {
      lightSurfaceTone.value = tone;
    }
  };
  const activeCustomSurfaceTones = computed(() =>
    isDarkMode.value ? darkCustomSurfaceTones.value : lightCustomSurfaceTones.value,
  );
  const setActiveCustomSurfaceTones = (customTones: SurfaceToneOverrides) => {
    if (isDarkMode.value) {
      darkCustomSurfaceTones.value = customTones;
    } else {
      lightCustomSurfaceTones.value = customTones;
    }
  };
  const customizationFor = (rolePalette: MaterialPreviewRolePalette) => {
    if (props.activeRole === rolePalette.role) {
      return activeCustomSurfaceTones.value;
    }

    const customizations = props.surfaceToneCustomizations[rolePalette.role];
    return isDarkMode.value ? customizations?.dark : customizations?.light;
  };
  const applyCustomSurfaceTones = (
    rolePalette: MaterialPreviewRolePalette,
    roleTones: Record<SurfaceToneRole, number>,
  ) => {
    const customTones = customizationFor(rolePalette);
    if (!customTones) return roleTones;

    return Object.fromEntries(
      Object.entries(roleTones).map(([role, tone]) => {
        const customTone = customTones[role as SurfaceToneRole];
        if (customTone === undefined) return [role, tone];

        return [role, nearestAvailableCustomTone(customTone, rolePalette)];
      }),
    ) as Record<SurfaceToneRole, number>;
  };
  const isSurfaceCardCustomized = (role: SurfaceRole) =>
    activeCustomSurfaceTones.value[role as SurfaceToneRole] !== undefined;
  const selectSurfaceCard = (role: SurfaceRole) => {
    selectedSurfaceCardRole.value = role;
  };
  const clearSurfaceCardCustomization = (role: SurfaceRole) => {
    const nextCustomTones = { ...activeCustomSurfaceTones.value };
    delete nextCustomTones[role as SurfaceToneRole];
    setActiveCustomSurfaceTones(nextCustomTones);
  };

  const previewSettingsFor = (rolePalette: MaterialPreviewRolePalette) => {
    const defaultLightTone = rolePalette.kind === 'surface' ? 100 : (rolePalette.baseTone ?? 50);
    const defaultDarkTone = rolePalette.kind === 'surface' ? 0 : (rolePalette.baseTone ?? 50);

    return {
      contrast:
        props.activeRole === rolePalette.role
          ? surfaceContrast.value
          : (props.surfaceContrastSettings[rolePalette.role] ?? 'low'),
      lightTone:
        props.activeRole === rolePalette.role
          ? lightSurfaceTone.value
          : (props.lightSurfaceToneSettings[rolePalette.role] ?? defaultLightTone),
      darkTone:
        props.activeRole === rolePalette.role
          ? darkSurfaceTone.value
          : (props.darkSurfaceToneSettings[rolePalette.role] ?? defaultDarkTone),
    };
  };

  const buildRoleSurfaceTones = (rolePalette: MaterialPreviewRolePalette) => {
    const settings = previewSettingsFor(rolePalette);

    if (rolePalette.kind !== 'surface') {
      const baseTone = rolePalette.baseTone ?? 50;
      const surfaceTone = isDarkMode.value ? settings.darkTone : settings.lightTone;

      return applyCustomSurfaceTones(
        rolePalette,
        buildAccentSurfaceRoleTones({
          tones: surfaceToneSourceFor(rolePalette),
          contrast: settings.contrast,
          surfaceTone,
          baseTone,
          excludedTone: rolePalette.excludedTone,
          isDarkMode: isDarkMode.value,
        }),
      );
    }

    return applyCustomSurfaceTones(
      rolePalette,
      buildSurfaceRoleTones({
        tones: surfaceToneSourceFor(rolePalette),
        isDarkMode: isDarkMode.value,
        contrast: settings.contrast,
        lightTone: settings.lightTone,
        darkTone: settings.darkTone,
        excludedTone: rolePalette.excludedTone,
      }),
    );
  };

  const surfaceTones = computed(() =>
    buildSurfaceRoleTones({
      tones: props.tones,
      isDarkMode: isDarkMode.value,
      contrast:
        props.activeRole === 'surface'
          ? surfaceContrast.value
          : props.surfaceContrastSettings.surface,
      lightTone:
        props.activeRole === 'surface'
          ? lightSurfaceTone.value
          : props.lightSurfaceToneSettings.surface,
      darkTone:
        props.activeRole === 'surface'
          ? darkSurfaceTone.value
          : props.darkSurfaceToneSettings.surface,
      excludedTone: paletteFor('surface').excludedTone,
    }),
  );
  const surfaceRoleTonesByPalette = computed(
    () =>
      Object.fromEntries(
        rolePalettes.value.map((rolePalette) => [
          rolePalette.role,
          buildRoleSurfaceTones(rolePalette),
        ]),
      ) as Record<TonalColorRole, Record<SurfaceToneRole, number>>,
  );
  const primarySurfaceTones = computed(
    () => surfaceRoleTonesByPalette.value.primary ?? surfaceTones.value,
  );
  const buildShowcaseStyles = (
    palette: MaterialPreviewRolePalette,
    role: Extract<SurfaceRole, 'surface' | 'inverse_surface'>,
  ) => {
    const tones = surfaceRoleTonesByPalette.value[palette.role] ?? surfaceTones.value;
    const backgroundTone = tones[role];
    const isInverse = role === 'inverse_surface';
    let foregroundTone = tones.on_surface;
    let foregroundVariantTone = tones.on_surface_variant;

    if (isInverse) {
      foregroundTone = tones.inverse_on_surface;
      foregroundVariantTone = foregroundTone;
    }

    const outlineTone = tones.outline;
    const outlineVariantTone = tones.outline_variant;

    return {
      '--preview-role-surface': toneAt(backgroundTone, '#ffffff', palette.role),
      '--preview-role-container': toneAt(tones.container, '#f3f4f6', palette.role),
      '--preview-role-on-surface': toneAt(foregroundTone, '#111827', palette.role),
      '--preview-role-on-surface-variant': toneAt(foregroundVariantTone, '#4b5563', palette.role),
      '--preview-role-on-container': toneAt(tones.on_surface_container, '#111827', palette.role),
      '--preview-role-on-container-variant': toneAt(
        tones.on_surface_container_variant,
        '#4b5563',
        palette.role,
      ),
      '--preview-role-outline': toneAt(outlineTone, '#6b7280', palette.role),
      '--preview-role-outline-variant': toneAt(outlineVariantTone, '#d1d5db', palette.role),
    };
  };
  const showcaseRows = computed(() =>
    showcasePalettes.value.map((palette) => ({
      palette,
      lightStyle: buildShowcaseStyles(palette, 'surface'),
      inverseStyle: buildShowcaseStyles(palette, 'inverse_surface'),
    })),
  );
  const primarySurfaceTonesLegacy = computed(() =>
    (() => {
      const baseTone = 50;
      let configuredTone = props.lightSurfaceToneSettings.primary ?? baseTone;

      if (props.activeRole === 'primary') {
        configuredTone = isDarkMode.value ? darkSurfaceTone.value : lightSurfaceTone.value;
      } else if (isDarkMode.value) {
        configuredTone = props.darkSurfaceToneSettings.primary ?? baseTone;
      }

      return buildAccentSurfaceRoleTones({
        tones: props.primaryTones ?? props.tones,
        contrast:
          props.activeRole === 'primary'
            ? surfaceContrast.value
            : props.surfaceContrastSettings.primary,
        surfaceTone: configuredTone,
        baseTone,
        excludedTone: paletteFor('primary').excludedTone,
        isDarkMode: isDarkMode.value,
      });
    })(),
  );
  const contrastLevels: SurfaceContrast[] = ['low', 'medium', 'high'];
  const surfaceContrastIndex = computed(() => contrastLevels.indexOf(surfaceContrast.value));
  const setSurfaceContrast = (event: Event) => {
    const index = Number((event.target as HTMLInputElement).value);
    surfaceContrast.value = contrastLevels[index] ?? 'low';
  };

  const surfaceStyles = computed(() => {
    const tones = surfaceRoleTonesByPalette.value.surface ?? surfaceTones.value;
    const primaryTones = props.rolePalettes.length
      ? primarySurfaceTones.value
      : primarySurfaceTonesLegacy.value;

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
          '--preview-on-surface-container': toneAt(tones.on_surface_container, '#e5e5e5'),
          '--preview-on-surface-container-variant': toneAt(
            tones.on_surface_container_variant,
            '#cccccc',
          ),
          '--preview-on-inverse': toneAt(tones.inverse_on_surface, '#333333'),
          '--preview-outline': toneAt(tones.outline, '#999999'),
          '--preview-outline-variant': toneAt(tones.outline_variant, '#4d4d4d'),
          '--preview-primary-surface-bright': toneAt(
            primaryTones.surface_bright,
            '#3d3d3d',
            'primary',
          ),
          '--preview-primary-inverse-surface': toneAt(
            primaryTones.inverse_surface,
            '#e5e5e5',
            'primary',
          ),
          '--preview-primary-on-surface': toneAt(primaryTones.on_surface, '#e5e5e5', 'primary'),
          '--preview-primary-on-surface-variant': toneAt(
            primaryTones.on_surface_variant,
            '#cccccc',
            'primary',
          ),
          '--preview-primary-on-surface-container': toneAt(
            primaryTones.on_surface_container,
            '#e5e5e5',
            'primary',
          ),
          '--preview-primary-on-surface-container-variant': toneAt(
            primaryTones.on_surface_container_variant,
            '#cccccc',
            'primary',
          ),
          '--preview-primary-on-inverse': toneAt(
            primaryTones.inverse_on_surface,
            '#333333',
            'primary',
          ),
          '--preview-primary-outline': toneAt(primaryTones.outline, '#999999', 'primary'),
          '--preview-primary-outline-variant': toneAt(
            primaryTones.outline_variant,
            '#4d4d4d',
            'primary',
          ),
          '--preview-primary': toneAt(primaryTones.surface, '#cccccc', 'primary'),
          '--preview-on-primary': toneAt(primaryTones.on_surface, '#333333', 'primary'),
          '--preview-primary-container': toneAt(primaryTones.container, '#4f378b', 'primary'),
          '--preview-on-primary-container': toneAt(
            primaryTones.on_surface_container,
            '#eaddff',
            'primary',
          ),
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
          '--preview-on-surface-container': toneAt(tones.on_surface_container, '#1a1a1a'),
          '--preview-on-surface-container-variant': toneAt(
            tones.on_surface_container_variant,
            '#595959',
          ),
          '--preview-on-inverse': toneAt(tones.inverse_on_surface, '#fafafa'),
          '--preview-outline': toneAt(tones.outline, '#7f7f7f'),
          '--preview-outline-variant': toneAt(tones.outline_variant, '#cccccc'),
          '--preview-primary-surface-bright': toneAt(
            primaryTones.surface_bright,
            '#fafafa',
            'primary',
          ),
          '--preview-primary-inverse-surface': toneAt(
            primaryTones.inverse_surface,
            '#333333',
            'primary',
          ),
          '--preview-primary-on-surface': toneAt(primaryTones.on_surface, '#1a1a1a', 'primary'),
          '--preview-primary-on-surface-variant': toneAt(
            primaryTones.on_surface_variant,
            '#595959',
            'primary',
          ),
          '--preview-primary-on-surface-container': toneAt(
            primaryTones.on_surface_container,
            '#1a1a1a',
            'primary',
          ),
          '--preview-primary-on-surface-container-variant': toneAt(
            primaryTones.on_surface_container_variant,
            '#595959',
            'primary',
          ),
          '--preview-primary-on-inverse': toneAt(
            primaryTones.inverse_on_surface,
            '#fafafa',
            'primary',
          ),
          '--preview-primary-outline': toneAt(primaryTones.outline, '#7f7f7f', 'primary'),
          '--preview-primary-outline-variant': toneAt(
            primaryTones.outline_variant,
            '#cccccc',
            'primary',
          ),
          '--preview-primary': toneAt(primaryTones.surface, '#6750a4', 'primary'),
          '--preview-on-primary': toneAt(primaryTones.on_surface, '#ffffff', 'primary'),
          '--preview-primary-container': toneAt(primaryTones.container, '#eaddff', 'primary'),
          '--preview-on-primary-container': toneAt(
            primaryTones.on_surface_container,
            '#21005d',
            'primary',
          ),
        };
  });

  const materialRoleLabel = (role: SurfaceRole) => {
    return t(`tonal_builder.surface_preview.roles.${role}`);
  };

  const roleLabel = (role: SurfaceRole, palette: TonalColorRole) => {
    const label = materialRoleLabel(role);
    const paletteLabel = paletteFor(palette).label;

    if (palette === 'surface') return label;
    if (role === 'container') {
      return t('tonal_builder.surface_preview.roles.role_container', { role: paletteLabel });
    }

    return t('tonal_builder.surface_preview.palette_role', { palette: paletteLabel, role: label });
  };

  const roleTone = (role: SurfaceRole, palette: TonalColorRole) => {
    return (surfaceRoleTonesByPalette.value[palette] ?? surfaceTones.value)[
      role as SurfaceToneRole
    ];
  };

  const adjustSelectedSurfaceCardTone = (role: SurfaceRole, event: WheelEvent) => {
    if (selectedSurfaceCardRole.value !== role) return;
    event.preventDefault();

    const palette = paletteFor(props.activeRole);
    const indices = [...new Set(fullToneSourceFor(palette).map((tone) => tone.index))].sort(
      (left, right) => left - right,
    );
    const currentTone = roleTone(role, props.activeRole);
    const currentIndex = Math.max(
      0,
      indices.indexOf(nearestAvailableCustomTone(currentTone, palette)),
    );
    const direction = event.deltaY < 0 ? 1 : -1;
    const nextTone = indices[Math.min(Math.max(currentIndex + direction, 0), indices.length - 1)];
    if (nextTone === undefined || nextTone === currentTone) return;

    setActiveCustomSurfaceTones({
      ...activeCustomSurfaceTones.value,
      [role]: nextTone,
    });
  };

  useEventListener(window, 'pointerdown', (event) => {
    const { target } = event;
    if (target instanceof Node && surfaceCardsRef.value?.contains(target)) return;
    selectedSurfaceCardRole.value = null;
  });

  const surfaceTooltip = (role: SurfaceRole, palette: TonalColorRole = 'surface') =>
    t('tonal_builder.surface_preview.surface_tooltip', {
      role: roleLabel(role, palette),
      tone: roleTone(role, palette),
    });

  const surfaceCardRoles: Array<{ role: SurfaceRole; cssVariable: string }> = [
    { role: 'surface', cssVariable: '--preview-surface' },
    { role: 'surface_bright', cssVariable: '--preview-surface-bright' },
    { role: 'surface_dim', cssVariable: '--preview-surface-dim' },
    { role: 'container_lowest', cssVariable: '--preview-surface-container-lowest' },
    { role: 'container_low', cssVariable: '--preview-surface-container-low' },
    { role: 'container', cssVariable: '--preview-surface-container' },
    { role: 'container_high', cssVariable: '--preview-surface-container-high' },
    { role: 'container_highest', cssVariable: '--preview-surface-container-highest' },
    { role: 'inverse_surface', cssVariable: '--preview-inverse-surface' },
    { role: 'inverse_on_surface', cssVariable: '--preview-on-inverse' },
    { role: 'on_surface', cssVariable: '--preview-on-surface' },
    { role: 'on_surface_variant', cssVariable: '--preview-on-surface-variant' },
    { role: 'on_surface_container', cssVariable: '--preview-on-surface-container' },
    {
      role: 'on_surface_container_variant',
      cssVariable: '--preview-on-surface-container-variant',
    },
    { role: 'outline', cssVariable: '--preview-outline' },
    { role: 'outline_variant', cssVariable: '--preview-outline-variant' },
  ];

  const buildSurfaceCard = (role: SurfaceRole, palette: TonalColorRole): SurfaceCard | null => {
    if (!(role in (surfaceRoleTonesByPalette.value[palette] ?? surfaceTones.value))) return null;

    const tone = roleTone(role, palette);

    return {
      role,
      cssVariable:
        surfaceCardRoles.find((surfaceCardRole) => surfaceCardRole.role === role)?.cssVariable ??
        '',
      tone,
      hex: toneAt(tone, '#000000', palette),
      textHex: toneAt(tone >= 60 ? 10 : 90, tone >= 60 ? '#1a1a1a' : '#e5e5e5', palette),
      label: roleLabel(role, palette),
      palette,
    };
  };

  const surfaceCards = computed(() =>
    surfaceCardRoles.flatMap(({ role, cssVariable }) => {
      const card = buildSurfaceCard(role, props.activeRole);

      return card ? [{ ...card, cssVariable }] : [];
    }),
  );

  const buildRoleActionStyles = (palette: MaterialPreviewRolePalette) => {
    const action = buildSurfaceCard('surface', palette.role);
    const onAction = buildSurfaceCard('on_surface', palette.role);
    const container = buildSurfaceCard('container', palette.role);
    const onContainer = buildSurfaceCard('on_surface_container', palette.role);
    const outline = buildSurfaceCard('outline', palette.role);
    const outlineVariant = buildSurfaceCard('outline_variant', palette.role);

    return {
      '--preview-role-action': action?.hex ?? '#6750a4',
      '--preview-role-on-action': onAction?.hex ?? '#ffffff',
      '--preview-role-action-container': container?.hex ?? '#eaddff',
      '--preview-role-on-action-container': onContainer?.hex ?? '#21005d',
      '--preview-role-outline': outline?.hex ?? '#79747e',
      '--preview-role-outline-variant': outlineVariant?.hex ?? '#cac4d0',
    };
  };

  const hoveredSurfaceCard = computed(() => {
    if (!hoveredSurfaceRole.value) return null;
    const role = hoveredSurfaceRole.value;
    const surfaceCard = buildSurfaceCard(role, hoveredPalette.value);

    if (surfaceCard) return surfaceCard;

    const tone = roleTone(role, hoveredPalette.value);

    return {
      role,
      tone,
      hex: toneAt(tone, '#000000', hoveredPalette.value),
      textHex: toneAt(
        tone >= 60 ? 10 : 90,
        tone >= 60 ? '#1a1a1a' : '#e5e5e5',
        hoveredPalette.value,
      ),
      label: roleLabel(role, hoveredPalette.value),
      palette: hoveredPalette.value,
    };
  });

  const surfaceRoleNames: Record<string, SurfaceRole> = {
    surface: 'surface',
    container: 'container',
    'surface-bright': 'surface_bright',
    'surface-dim': 'surface_dim',
    'surface-container-lowest': 'container_lowest',
    'surface-container-low': 'container_low',
    'surface-container': 'container',
    'surface-container-high': 'container_high',
    'surface-container-highest': 'container_highest',
    'inverse-surface': 'inverse_surface',
    'inverse-on-surface': 'inverse_on_surface',
    'on-surface': 'on_surface',
    'on-surface-variant': 'on_surface_variant',
    'on-surface-container': 'on_surface_container',
    'on-surface-container-variant': 'on_surface_container_variant',
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
    hoveredPalette.value =
      surface.dataset.surfacePalette && hasPalette(surface.dataset.surfacePalette)
        ? surface.dataset.surfacePalette
        : 'surface';
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
        class="preview-tone-control"
        data-cy="surface-tone-control"
      >
        <div class="preview-control-heading">
          <label for="surface-tone-slider">
            {{ t('tonal_builder.surface_preview.surface_tone.label') }}
          </label>
          <strong data-cy="surface-tone-value">
            {{
              t('tonal_builder.surface_preview.tone_value', {
                tone: activeSurfaceTone,
              })
            }}
          </strong>
        </div>
        <input
          id="surface-tone-slider"
          type="range"
          min="0"
          :max="Math.max(selectableSurfaceToneIndices.length - 1, 0)"
          step="1"
          :value="activeSurfaceToneIndex"
          :aria-valuetext="
            t('tonal_builder.surface_preview.tone_value', {
              tone: activeSurfaceTone,
            })
          "
          data-cy="surface-tone-slider"
          @input="setSurfaceTone"
        />
        <div
          class="preview-tone-levels"
          :style="{ gridTemplateColumns: `repeat(${selectableSurfaceToneIndices.length}, 1fr)` }"
          data-cy="surface-tone-labels"
        >
          <span
            v-for="(tone, index) in selectableSurfaceToneIndices"
            :key="tone"
            :class="{
              'preview-tone-active': activeSurfaceTone === tone,
              'preview-tone-label-start': index === 0,
              'preview-tone-label-end': index === selectableSurfaceToneIndices.length - 1,
            }"
          >
            {{ tone }}
          </span>
        </div>
      </div>

      <div
        class="preview-contrast-control"
        data-cy="surface-contrast-control"
      >
        <div class="preview-control-heading">
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
      ref="surfaceCardsRef"
      class="preview-surface-cards"
      :aria-label="t('tonal_builder.surface_preview.surface_cards')"
      data-cy="surface-role-cards"
    >
      <article
        v-for="card in surfaceCards"
        :key="card.role"
        class="preview-surface-card"
        :class="{
          'preview-surface-card-selected': selectedSurfaceCardRole === card.role,
          'preview-surface-card-customized': isSurfaceCardCustomized(card.role),
        }"
        :style="{
          backgroundColor: card.hex,
          '--preview-card-text': card.textHex,
        }"
        role="button"
        tabindex="0"
        :aria-pressed="selectedSurfaceCardRole === card.role"
        :aria-label="
          t('tonal_builder.surface_preview.customize_card', {
            role: card.label,
            tone: card.tone,
          })
        "
        :data-surface-card="card.role"
        :data-selected="selectedSurfaceCardRole === card.role ? 'true' : undefined"
        :data-customized="isSurfaceCardCustomized(card.role) ? 'true' : undefined"
        @click="selectSurfaceCard(card.role)"
        @keydown.enter.prevent="selectSurfaceCard(card.role)"
        @keydown.space.prevent="selectSurfaceCard(card.role)"
        @wheel="adjustSelectedSurfaceCardTone(card.role, $event)"
      >
        <strong>
          {{ card.label }}
        </strong>
        <span>
          {{
            t('tonal_builder.surface_preview.tone_value', {
              tone: card.tone,
            })
          }}
          <small>{{ card.hex }}</small>
        </span>
        <button
          v-if="isSurfaceCardCustomized(card.role)"
          type="button"
          class="preview-surface-card-reset"
          :aria-label="
            t('tonal_builder.surface_preview.reset_customization', {
              role: card.label,
            })
          "
          data-cy="surface-card-reset"
          @click.stop="clearSurfaceCardCustomization(card.role)"
        >
          <ArrowPathIcon aria-hidden="true" />
        </button>
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
          <span
            class="preview-brand-mark"
            data-surface-role="surface"
            data-surface-palette="primary"
            :data-surface-tooltip="surfaceTooltip('surface', 'primary')"
            >TS</span
          >
          <span
            data-surface-role="on-surface-container"
            :data-surface-tooltip="surfaceTooltip('on_surface_container')"
            >{{ t('tonal_builder.surface_preview.app_name') }}</span
          >
        </div>

        <nav
          class="preview-nav"
          :aria-label="t('tonal_builder.surface_preview.navigation')"
        >
          <span
            data-surface-role="on-surface-container-variant"
            :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
            >{{ t('tonal_builder.surface_preview.nav.dashboard') }}</span
          >
          <span
            data-surface-role="on-surface-container-variant"
            :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
            >{{ t('tonal_builder.surface_preview.nav.orders') }}</span
          >
          <span
            class="preview-nav-active"
            data-surface-role="on-surface-container"
            :data-surface-tooltip="surfaceTooltip('on_surface_container')"
            >{{ t('tonal_builder.surface_preview.nav.billing') }}</span
          >
        </nav>

        <div class="preview-profile">
          <span
            class="preview-icon-role"
            data-surface-role="on-surface-container"
            :data-surface-tooltip="surfaceTooltip('on_surface_container')"
          >
            <BellIcon aria-hidden="true" />
          </span>
          <span
            data-surface-role="on-surface-container"
            :data-surface-tooltip="surfaceTooltip('on_surface_container')"
            >DC</span
          >
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
            data-surface-role="on-surface-container-variant"
            :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
          >
            {{ t('tonal_builder.surface_preview.eyebrow') }}
          </p>
          <h3
            data-surface-role="on-surface-container"
            :data-surface-tooltip="surfaceTooltip('on_surface_container')"
          >
            {{ t('tonal_builder.surface_preview.heading') }}
          </h3>
        </div>
        <div class="preview-toolbar-actions">
          <button
            type="button"
            data-surface-role="surface"
            data-surface-palette="primary"
            :data-surface-tooltip="surfaceTooltip('surface', 'primary')"
          >
            <span
              class="preview-icon-role"
              data-surface-role="on-surface"
              data-surface-palette="primary"
              :data-surface-tooltip="surfaceTooltip('on_surface', 'primary')"
            >
              <PlusIcon aria-hidden="true" />
            </span>
            <span
              data-surface-role="on-surface"
              data-surface-palette="primary"
              :data-surface-tooltip="surfaceTooltip('on_surface', 'primary')"
              >{{ t('tonal_builder.surface_preview.actions.add') }}</span
            >
          </button>
          <button
            v-if="secondaryPalette"
            type="button"
            class="preview-role-action"
            data-surface-role="surface"
            data-surface-palette="secondary"
            :data-surface-tooltip="surfaceTooltip('surface', 'secondary')"
            :style="buildRoleActionStyles(secondaryPalette)"
            data-cy="secondary-action"
          >
            <span
              data-surface-role="on-surface"
              data-surface-palette="secondary"
              :data-surface-tooltip="surfaceTooltip('on_surface', 'secondary')"
              >{{ t('tonal_builder.surface_preview.role_examples.secondary_action') }}</span
            >
          </button>
          <button
            v-if="tertiaryPalette"
            type="button"
            class="preview-role-action preview-role-action-tonal"
            data-surface-role="surface-container"
            data-surface-palette="tertiary"
            :data-surface-tooltip="surfaceTooltip('container', 'tertiary')"
            :style="buildRoleActionStyles(tertiaryPalette)"
            data-cy="tertiary-action"
          >
            <span
              data-surface-role="on-surface-container"
              data-surface-palette="tertiary"
              :data-surface-tooltip="surfaceTooltip('on_surface_container', 'tertiary')"
              >{{ t('tonal_builder.surface_preview.role_examples.tertiary_action') }}</span
            >
          </button>
        </div>
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
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ metric.label }}</span
            >
            <strong
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >{{ metric.value }}</strong
            >
            <small
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ metric.helper }}</small
            >
          </div>
          <span
            class="preview-icon-role preview-metric-icon"
            data-surface-role="on-surface-container"
            :data-surface-tooltip="surfaceTooltip('on_surface_container')"
          >
            <component
              :is="metric.icon"
              aria-hidden="true"
            />
          </span>
        </article>
      </section>

      <div class="preview-workspace">
        <aside
          class="preview-filters"
          data-surface-role="surface-container-low"
          :data-surface-tooltip="surfaceTooltip('container_low')"
        >
          <div class="preview-panel-heading">
            <span
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >{{ t('tonal_builder.surface_preview.filters.title') }}</span
            >
            <span
              class="preview-icon-role"
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
            >
              <ChevronDownIcon aria-hidden="true" />
            </span>
          </div>

          <label>
            <span
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.filters.search') }}</span
            >
            <span
              class="preview-input"
              data-surface-role="outline"
              :data-surface-tooltip="surfaceTooltip('outline')"
            >
              <span
                class="preview-icon-role"
                data-surface-role="on-surface-container-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >
                <MagnifyingGlassIcon aria-hidden="true" />
              </span>
              <span
                data-surface-role="on-surface-container-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >{{ t('tonal_builder.surface_preview.filters.placeholder') }}</span
              >
            </span>
          </label>

          <div class="preview-filter-grid">
            <label>
              <span
                data-surface-role="on-surface-container-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >{{ t('tonal_builder.surface_preview.filters.status') }}</span
              >
              <span
                class="preview-input"
                data-surface-role="outline"
                :data-surface-tooltip="surfaceTooltip('outline')"
                ><span
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                  >{{ t('tonal_builder.surface_preview.filters.all') }}</span
                ></span
              >
            </label>
            <label>
              <span
                data-surface-role="on-surface-container-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >{{ t('tonal_builder.surface_preview.filters.period') }}</span
              >
              <span
                class="preview-input"
                data-surface-role="outline"
                :data-surface-tooltip="surfaceTooltip('outline')"
                ><span
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                  >{{ t('tonal_builder.surface_preview.filters.month') }}</span
                ></span
              >
            </label>
          </div>

          <label
            v-if="errorPalette"
            class="preview-validation-field"
            :style="buildRoleActionStyles(errorPalette)"
            data-cy="error-validation"
          >
            <span
              class="preview-validation-label"
              data-surface-role="on-surface"
              data-surface-palette="error"
              :data-surface-tooltip="surfaceTooltip('on_surface', 'error')"
            >
              {{ t('tonal_builder.surface_preview.role_examples.validation_label') }}
            </span>
            <span
              class="preview-validation-input"
              data-surface-role="outline"
              data-surface-palette="error"
              :data-surface-tooltip="surfaceTooltip('outline', 'error')"
            >
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >overdue@example</span
              >
            </span>
            <small
              class="preview-validation-helper"
              data-surface-role="surface-container"
              data-surface-palette="error"
              :data-surface-tooltip="surfaceTooltip('container', 'error')"
            >
              <span
                data-surface-role="on-surface-container"
                data-surface-palette="error"
                :data-surface-tooltip="surfaceTooltip('on_surface_container', 'error')"
              >
                {{ t('tonal_builder.surface_preview.role_examples.validation_helper') }}
              </span>
            </small>
          </label>

          <div class="preview-filter-section">
            <span
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.filters.saved_view') }}</span
            >
            <button
              type="button"
              data-surface-role="outline"
              :data-surface-tooltip="surfaceTooltip('outline')"
            >
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.filters.collection') }}</span
              >
              <span
                class="preview-icon-role"
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >
                <ChevronDownIcon aria-hidden="true" />
              </span>
            </button>
          </div>

          <div class="preview-filter-section">
            <span
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.filters.active') }}</span
            >
            <div
              class="preview-filter-chips"
              data-surface-role="container"
              data-surface-palette="primary"
              :data-surface-tooltip="surfaceTooltip('container', 'primary')"
            >
              <span
                data-surface-role="on-surface-container"
                data-surface-palette="primary"
                :data-surface-tooltip="surfaceTooltip('on_surface_container', 'primary')"
                >{{ t('tonal_builder.surface_preview.status.review') }}</span
              >
              <span
                data-surface-role="on-surface-container"
                data-surface-palette="primary"
                :data-surface-tooltip="surfaceTooltip('on_surface_container', 'primary')"
                >{{ t('tonal_builder.surface_preview.filters.high_value') }}</span
              >
            </div>
          </div>

          <div
            class="preview-summary"
            data-surface-role="surface-container-high"
            :data-surface-tooltip="surfaceTooltip('container_high')"
          >
            <span
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.summary.label') }}</span
            >
            <strong
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >$42,350</strong
            >
            <small
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.summary.helper') }}</small
            >
          </div>

          <section
            class="preview-collection-health"
            data-surface-role="surface-container"
            :data-surface-tooltip="surfaceTooltip('container')"
          >
            <div class="preview-panel-heading">
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.collection_health.title') }}</span
              >
              <strong
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >74%</strong
              >
            </div>
            <div
              class="preview-collection-track"
              data-surface-role="surface-container-lowest"
              :data-surface-tooltip="surfaceTooltip('container_lowest')"
            >
              <span
                class="preview-collection-progress"
                data-surface-role="surface"
                data-surface-palette="primary"
                :data-surface-tooltip="surfaceTooltip('surface', 'primary')"
              />
            </div>
            <div
              class="preview-collection-stat preview-collection-stat-lowest"
              data-surface-role="surface-container-lowest"
              :data-surface-tooltip="surfaceTooltip('container_lowest')"
            >
              <span
                data-surface-role="on-surface-container-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >{{ t('tonal_builder.surface_preview.collection_health.follow_up') }}</span
              >
              <strong
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >8</strong
              >
            </div>
            <div
              class="preview-collection-stat preview-collection-stat-highest"
              data-surface-role="surface-container-highest"
              :data-surface-tooltip="surfaceTooltip('container_highest')"
            >
              <span
                data-surface-role="on-surface-container-variant"
                :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >{{ t('tonal_builder.surface_preview.collection_health.at_risk') }}</span
              >
              <strong
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >$18,240</strong
              >
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
              <span
                data-surface-role="on-surface"
                :data-surface-tooltip="surfaceTooltip('on_surface')"
                >{{ t('tonal_builder.surface_preview.table.view') }}</span
              >
              <span
                class="preview-icon-role"
                data-surface-role="on-surface"
                :data-surface-tooltip="surfaceTooltip('on_surface')"
              >
                <EllipsisVerticalIcon aria-hidden="true" />
              </span>
            </div>
          </div>

          <div
            v-if="errorPalette"
            class="preview-alert"
            data-surface-role="surface-container"
            data-surface-palette="error"
            :data-surface-tooltip="surfaceTooltip('container', 'error')"
            :style="buildRoleActionStyles(errorPalette)"
            data-cy="error-alert"
          >
            <span
              class="preview-alert-icon"
              data-surface-role="on-surface-container"
              data-surface-palette="error"
              :data-surface-tooltip="surfaceTooltip('on_surface_container', 'error')"
            >
              <ExclamationTriangleIcon aria-hidden="true" />
            </span>
            <div>
              <strong
                data-surface-role="on-surface-container"
                data-surface-palette="error"
                :data-surface-tooltip="surfaceTooltip('on_surface_container', 'error')"
              >
                {{ t('tonal_builder.surface_preview.role_examples.alert_title') }}
              </strong>
              <span
                class="preview-alert-body"
                data-surface-role="on-surface-container"
                data-surface-palette="error"
                :data-surface-tooltip="surfaceTooltip('on_surface_container', 'error')"
              >
                {{ t('tonal_builder.surface_preview.role_examples.alert_body') }}
              </span>
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
                :data-surface-role="index === 1 ? 'inverse-on-surface' : 'on-surface-container'"
                :data-surface-tooltip="
                  index === 1
                    ? surfaceTooltip('inverse_on_surface')
                    : surfaceTooltip('on_surface_container')
                "
                >{{ row.code }}</strong
              >
              <span
                :data-surface-role="index === 1 ? 'inverse-on-surface' : 'on-surface-container'"
                :data-surface-tooltip="
                  index === 1
                    ? surfaceTooltip('inverse_on_surface')
                    : surfaceTooltip('on_surface_container')
                "
                >{{ row.customer }}</span
              >
              <span
                :data-surface-role="
                  index === 1 ? 'inverse-on-surface' : 'on-surface-container-variant'
                "
                :data-surface-tooltip="
                  index === 1
                    ? surfaceTooltip('inverse_on_surface')
                    : surfaceTooltip('on_surface_container_variant')
                "
                >{{ row.status }}</span
              >
              <span
                :data-surface-role="index === 1 ? 'inverse-on-surface' : 'on-surface-container'"
                :data-surface-tooltip="
                  index === 1
                    ? surfaceTooltip('inverse_on_surface')
                    : surfaceTooltip('on_surface_container')
                "
                >{{ row.total }}</span
              >
            </div>
          </div>

          <div
            class="preview-table-footer"
            data-surface-role="surface-container-low"
            :data-surface-tooltip="surfaceTooltip('container_low')"
          >
            <span
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.table.showing') }}</span
            >
            <strong
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >{{ t('tonal_builder.surface_preview.table.page_total') }} $42,350</strong
            >
          </div>

          <div class="preview-table-dashboard">
            <section
              class="preview-reconciliation"
              data-surface-role="surface-container"
              :data-surface-tooltip="surfaceTooltip('container')"
            >
              <div class="preview-panel-heading">
                <div class="preview-panel-title">
                  <strong
                    data-surface-role="on-surface-container"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.title') }}</strong
                  >
                  <small
                    data-surface-role="on-surface-container-variant"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.helper') }}</small
                  >
                </div>
                <span
                  class="preview-reconciliation-badge"
                  data-surface-role="surface-container-highest"
                  :data-surface-tooltip="surfaceTooltip('container_highest')"
                  ><span
                    data-surface-role="on-surface-container"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.open') }}</span
                  ></span
                >
              </div>
              <div
                class="preview-reconciliation-item preview-reconciliation-item-lowest"
                data-surface-role="surface-container-lowest"
                :data-surface-tooltip="surfaceTooltip('container_lowest')"
              >
                <span
                  class="preview-reconciliation-icon"
                  data-surface-role="surface-container-highest"
                  :data-surface-tooltip="surfaceTooltip('container_highest')"
                >
                  <span
                    class="preview-icon-role preview-reconciliation-icon-svg"
                    data-surface-role="on-surface-container"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                  >
                    <CreditCardIcon aria-hidden="true" />
                  </span>
                </span>
                <div class="preview-reconciliation-copy">
                  <strong
                    data-surface-role="on-surface-container"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.gateway') }}</strong
                  >
                  <small
                    data-surface-role="on-surface-container-variant"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.gateway_helper') }}</small
                  >
                </div>
                <strong
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                  >$6,240</strong
                >
              </div>
              <div
                class="preview-reconciliation-item preview-reconciliation-item-high"
                data-surface-role="surface-container-high"
                :data-surface-tooltip="surfaceTooltip('container_high')"
              >
                <span
                  class="preview-reconciliation-icon"
                  data-surface-role="surface-container-highest"
                  :data-surface-tooltip="surfaceTooltip('container_highest')"
                >
                  <span
                    class="preview-icon-role preview-reconciliation-icon-svg"
                    data-surface-role="on-surface-container"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                  >
                    <DocumentTextIcon aria-hidden="true" />
                  </span>
                </span>
                <div class="preview-reconciliation-copy">
                  <strong
                    data-surface-role="on-surface-container"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.credit') }}</strong
                  >
                  <small
                    data-surface-role="on-surface-container-variant"
                    :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                    >{{ t('tonal_builder.surface_preview.reconciliation.credit_helper') }}</small
                  >
                </div>
                <strong
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                  >$1,890</strong
                >
              </div>
            </section>

            <section
              class="preview-settlement"
              data-surface-role="surface-bright"
              :data-surface-tooltip="surfaceTooltip('surface_bright')"
            >
              <div class="preview-panel-heading">
                <div class="preview-panel-title">
                  <strong
                    data-surface-role="on-surface"
                    :data-surface-tooltip="surfaceTooltip('on_surface')"
                    >{{ t('tonal_builder.surface_preview.settlement.title') }}</strong
                  >
                  <small
                    data-surface-role="on-surface-variant"
                    :data-surface-tooltip="surfaceTooltip('on_surface_variant')"
                    >{{ t('tonal_builder.surface_preview.settlement.helper') }}</small
                  >
                </div>
                <strong
                  data-surface-role="on-surface"
                  :data-surface-tooltip="surfaceTooltip('on_surface')"
                  >$31,860</strong
                >
              </div>
              <div
                class="preview-settlement-chart"
                data-surface-role="outline-variant"
                :data-surface-tooltip="surfaceTooltip('outline_variant')"
              >
                <span
                  v-for="index in 6"
                  :key="index"
                  :class="`preview-settlement-bar preview-settlement-bar-${index}`"
                  data-surface-role="surface"
                  data-surface-palette="primary"
                  :data-surface-tooltip="surfaceTooltip('surface', 'primary')"
                />
              </div>
              <div
                class="preview-settlement-total"
                data-surface-role="surface-container-low"
                :data-surface-tooltip="surfaceTooltip('container_low')"
              >
                <span
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                  >{{ t('tonal_builder.surface_preview.settlement.next') }}</span
                >
                <strong
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                  >{{ t('tonal_builder.surface_preview.settlement.tomorrow') }}</strong
                >
              </div>
            </section>

            <template
              v-for="showcase in showcaseRows"
              :key="showcase.palette.role"
            >
              <section
                class="preview-primary-example preview-role-showcase"
                data-surface-role="surface"
                :data-surface-palette="showcase.palette.role"
                :data-surface-tooltip="surfaceTooltip('surface', showcase.palette.role)"
                :style="showcase.lightStyle"
              >
                <div class="preview-primary-example-heading">
                  <div>
                    <small
                      class="preview-primary-example-eyebrow"
                      data-surface-role="on-surface-variant"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('on_surface_variant', showcase.palette.role)
                      "
                    >
                      {{ showcase.palette.label }}
                    </small>
                    <strong
                      data-surface-role="on-surface"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="surfaceTooltip('on_surface', showcase.palette.role)"
                    >
                      {{ t('tonal_builder.surface_preview.primary_examples.light_title') }}
                    </strong>
                  </div>
                  <span
                    class="preview-primary-example-status"
                    data-surface-role="outline"
                    :data-surface-palette="showcase.palette.role"
                    :data-surface-tooltip="surfaceTooltip('outline', showcase.palette.role)"
                  >
                    {{ t('tonal_builder.surface_preview.primary_examples.ready') }}
                  </span>
                </div>
                <div
                  class="preview-primary-example-body"
                  data-surface-role="container"
                  :data-surface-palette="showcase.palette.role"
                  :data-surface-tooltip="surfaceTooltip('container', showcase.palette.role)"
                >
                  <span
                    class="preview-primary-example-icon"
                    data-surface-role="on-surface-container"
                    :data-surface-palette="showcase.palette.role"
                    :data-surface-tooltip="
                      surfaceTooltip('on_surface_container', showcase.palette.role)
                    "
                  >
                    <CreditCardIcon aria-hidden="true" />
                  </span>
                  <div>
                    <strong
                      data-surface-role="on-surface-container"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('on_surface_container', showcase.palette.role)
                      "
                    >
                      $18,920
                    </strong>
                    <span
                      class="preview-primary-example-helper"
                      data-surface-role="on-surface-container-variant"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('on_surface_container_variant', showcase.palette.role)
                      "
                    >
                      {{ t('tonal_builder.surface_preview.primary_examples.light_helper') }}
                    </span>
                  </div>
                </div>
              </section>

              <section
                class="preview-primary-example preview-primary-example-inverse preview-role-showcase"
                data-surface-role="inverse-surface"
                :data-surface-palette="showcase.palette.role"
                :data-surface-tooltip="surfaceTooltip('inverse_surface', showcase.palette.role)"
                :style="showcase.inverseStyle"
              >
                <div class="preview-primary-example-heading">
                  <div>
                    <small
                      class="preview-primary-example-eyebrow"
                      data-surface-role="inverse-on-surface"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('inverse_on_surface', showcase.palette.role)
                      "
                    >
                      {{ showcase.palette.label }}
                    </small>
                    <strong
                      data-surface-role="inverse-on-surface"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('inverse_on_surface', showcase.palette.role)
                      "
                    >
                      {{ t('tonal_builder.surface_preview.primary_examples.inverse_title') }}
                    </strong>
                  </div>
                  <span
                    class="preview-primary-example-icon"
                    data-surface-role="inverse-on-surface"
                    :data-surface-palette="showcase.palette.role"
                    :data-surface-tooltip="
                      surfaceTooltip('inverse_on_surface', showcase.palette.role)
                    "
                  >
                    <ShieldCheckIcon aria-hidden="true" />
                  </span>
                </div>
                <div
                  class="preview-primary-example-body"
                  data-surface-role="outline"
                  :data-surface-palette="showcase.palette.role"
                  :data-surface-tooltip="surfaceTooltip('outline', showcase.palette.role)"
                >
                  <div>
                    <strong
                      data-surface-role="inverse-on-surface"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('inverse_on_surface', showcase.palette.role)
                      "
                    >
                      96%
                    </strong>
                    <span
                      class="preview-primary-example-helper"
                      data-surface-role="inverse-on-surface"
                      :data-surface-palette="showcase.palette.role"
                      :data-surface-tooltip="
                        surfaceTooltip('inverse_on_surface', showcase.palette.role)
                      "
                    >
                      {{ t('tonal_builder.surface_preview.primary_examples.inverse_helper') }}
                    </span>
                  </div>
                  <span
                    class="preview-primary-example-rule"
                    data-surface-role="outline-variant"
                    :data-surface-palette="showcase.palette.role"
                    :data-surface-tooltip="surfaceTooltip('outline_variant', showcase.palette.role)"
                  />
                </div>
              </section>
            </template>
          </div>

          <div
            class="preview-snackbar"
            data-surface-role="inverse-surface"
            :data-surface-tooltip="surfaceTooltip('inverse_surface')"
          >
            <span
              data-surface-role="inverse-on-surface"
              :data-surface-tooltip="surfaceTooltip('inverse_on_surface')"
            >
              {{ t('tonal_builder.surface_preview.activity.approved') }}
            </span>
          </div>
        </main>

        <aside
          class="preview-inspector"
          data-surface-role="surface-container-low"
          :data-surface-tooltip="surfaceTooltip('container_low')"
        >
          <div class="preview-panel-heading">
            <span
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >{{ t('tonal_builder.surface_preview.details.title') }}</span
            >
            <span
              class="preview-icon-role"
              data-surface-role="on-surface-container"
              :data-surface-tooltip="surfaceTooltip('on_surface_container')"
            >
              <EllipsisVerticalIcon aria-hidden="true" />
            </span>
          </div>

          <section
            class="preview-inspector-card"
            data-surface-role="surface-container-low"
            :data-surface-tooltip="surfaceTooltip('container_low')"
          >
            <div class="preview-customer">
              <span
                class="preview-avatar"
                data-surface-role="surface"
                data-surface-palette="primary"
                :data-surface-tooltip="surfaceTooltip('surface', 'primary')"
              >
                <span
                  data-surface-role="on-surface"
                  data-surface-palette="primary"
                  :data-surface-tooltip="surfaceTooltip('on_surface', 'primary')"
                  >AS</span
                >
              </span>
              <div>
                <strong
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                  >{{ t('tonal_builder.surface_preview.rows.studio') }}</strong
                >
                <small
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                  >{{ t('tonal_builder.surface_preview.details.customer_since') }}</small
                >
              </div>
            </div>
            <dl>
              <div>
                <dt
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >
                  {{ t('tonal_builder.surface_preview.details.due') }}
                </dt>
                <dd
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >
                  2026-07-15
                </dd>
              </div>
              <div>
                <dt
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >
                  {{ t('tonal_builder.surface_preview.details.owner') }}
                </dt>
                <dd
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >
                  D. Cote
                </dd>
              </div>
            </dl>
          </section>

          <section
            class="preview-health-card"
            data-surface-role="surface-container-high"
            :data-surface-tooltip="surfaceTooltip('container_high')"
          >
            <div class="preview-health-heading">
              <span
                class="preview-icon-role"
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
              >
                <ShieldCheckIcon aria-hidden="true" />
              </span>
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.health.title') }}</span
              >
              <strong
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >92%</strong
              >
            </div>
            <div
              class="preview-health-track"
              data-surface-role="surface-container-lowest"
              :data-surface-tooltip="surfaceTooltip('container_lowest')"
            >
              <span
                class="preview-health-progress"
                data-surface-role="surface"
                data-surface-palette="primary"
                :data-surface-tooltip="surfaceTooltip('surface', 'primary')"
              />
            </div>
            <small
              data-surface-role="on-surface-container-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
              >{{ t('tonal_builder.surface_preview.health.helper') }}</small
            >
          </section>

          <section
            class="preview-payment-card"
            data-surface-role="surface-container-lowest"
            :data-surface-tooltip="surfaceTooltip('container_lowest')"
          >
            <div class="preview-panel-heading">
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.payment.title') }}</span
              >
              <strong
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >$8,920</strong
              >
            </div>
            <dl>
              <div>
                <dt
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >
                  {{ t('tonal_builder.surface_preview.payment.method') }}
                </dt>
                <dd
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >
                  &bull;&bull;&bull;&bull; 4832
                </dd>
              </div>
              <div>
                <dt
                  data-surface-role="on-surface-container-variant"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container_variant')"
                >
                  {{ t('tonal_builder.surface_preview.payment.terms') }}
                </dt>
                <dd
                  data-surface-role="on-surface-container"
                  :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >
                  Net 30
                </dd>
              </div>
            </dl>
          </section>

          <section
            class="preview-note"
            data-surface-role="surface-bright"
            :data-surface-tooltip="surfaceTooltip('surface_bright')"
          >
            <strong
              data-surface-role="on-surface"
              :data-surface-tooltip="surfaceTooltip('on_surface')"
              >{{ t('tonal_builder.surface_preview.note.title') }}</strong
            >
            <p
              data-surface-role="on-surface-variant"
              :data-surface-tooltip="surfaceTooltip('on_surface_variant')"
            >
              {{ t('tonal_builder.surface_preview.note.body') }}
            </p>
          </section>

          <section
            class="preview-activity"
            data-surface-role="surface-container"
            :data-surface-tooltip="surfaceTooltip('container')"
          >
            <div class="preview-panel-heading">
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.activity.title') }}</span
              >
            </div>
            <p>
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.activity.approved') }}</span
              >
            </p>
            <p>
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.activity.sent') }}</span
              >
            </p>
            <p>
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.activity.created') }}</span
              >
            </p>
            <p>
              <span
                data-surface-role="on-surface-container"
                :data-surface-tooltip="surfaceTooltip('on_surface_container')"
                >{{ t('tonal_builder.surface_preview.activity.viewed') }}</span
              >
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
          backgroundColor: hoveredSurfaceCard.hex,
          '--preview-card-text': hoveredSurfaceCard.textHex,
        }"
        data-cy="surface-tooltip"
      >
        <strong>{{ hoveredSurfaceCard.label }}</strong>
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

  .preview-tone-control,
  .preview-contrast-control {
    display: grid;
    gap: 8px;
    color: rgb(var(--color-text-secondary));
    font-size: 12px;
    font-weight: 600;
  }

  .preview-tone-control {
    flex: 0 1 220px;
    width: min(220px, 100%);
  }

  .preview-contrast-control {
    flex: 0 1 220px;
    width: min(220px, 100%);
  }

  .preview-control-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .preview-control-heading label {
    color: rgb(var(--color-text-primary));
  }

  .preview-control-heading strong {
    color: rgb(var(--color-accent));
    font-size: 12px;
    font-weight: 700;
  }

  .preview-icon-role {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: inherit;
  }

  .preview-icon-role > svg {
    width: 100%;
    height: 100%;
  }

  .preview-tone-control input,
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

  .preview-tone-control input::-webkit-slider-thumb,
  .preview-contrast-control input::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
    appearance: none;
    border: 3px solid rgb(var(--color-surface));
    border-radius: 50%;
    background: rgb(var(--color-accent-strong));
    box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
  }

  .preview-tone-control input::-moz-range-thumb,
  .preview-contrast-control input::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 3px solid rgb(var(--color-surface));
    border-radius: 50%;
    background: rgb(var(--color-accent-strong));
    box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
  }

  .preview-tone-control input:focus-visible,
  .preview-contrast-control input:focus-visible {
    outline: 2px solid rgb(var(--color-accent));
    outline-offset: 5px;
  }

  .preview-contrast-levels {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 10px;
  }

  .preview-tone-levels {
    display: grid;
    font-size: 10px;
  }

  .preview-tone-levels span {
    text-align: center;
  }

  .preview-tone-label-start {
    text-align: left;
  }

  .preview-tone-label-end {
    text-align: right;
  }

  .preview-contrast-level-center {
    text-align: center;
  }

  .preview-contrast-level-end {
    text-align: right;
  }

  .preview-tone-levels .preview-tone-active,
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
    position: relative;
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

  .preview-surface-card:hover,
  .preview-surface-card:focus-visible,
  .preview-surface-card-selected {
    outline: 2px solid rgb(var(--color-accent));
    outline-offset: 2px;
  }

  .preview-surface-card-customized {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--preview-card-text) 38%, transparent),
      0 2px 6px rgb(0 0 0 / 8%);
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

  .preview-surface-card-reset {
    position: absolute;
    top: 5px;
    right: 5px;
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    padding: 0;
    background: color-mix(in srgb, var(--preview-card-text) 10%, transparent);
    color: var(--preview-card-text);
    opacity: 0.78;
  }

  .preview-surface-card-reset svg {
    width: 13px;
    height: 13px;
  }

  .preview-surface-card-reset:hover,
  .preview-surface-card-reset:focus-visible {
    opacity: 1;
    outline: 2px solid currentcolor;
    outline-offset: 2px;
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

    .preview-tone-control {
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

  .preview-profile .preview-icon-role,
  .preview-panel-heading .preview-icon-role,
  .preview-table-tools .preview-icon-role {
    width: 15px;
    height: 15px;
  }

  .preview-toolbar {
    height: 66px;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--preview-surface-container);
    border-bottom: 1px solid var(--preview-outline-variant);
    color: var(--preview-on-surface-container);
  }

  .preview-eyebrow {
    margin: 0 0 2px;
    color: var(--preview-on-surface-container-variant);
    font-size: 9px;
    text-transform: uppercase;
  }

  .preview-toolbar h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }

  .preview-toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 7px;
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

  .preview-toolbar .preview-role-action {
    background: var(--preview-role-action);
    color: var(--preview-role-on-action);
  }

  .preview-toolbar .preview-role-action-tonal {
    border: 1px solid var(--preview-role-outline);
    background: var(--preview-role-action-container);
    color: var(--preview-role-on-action-container);
  }

  .preview-metric-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    color: var(--preview-on-surface-container);
  }

  .preview-health-heading .preview-icon-role,
  .preview-input .preview-icon-role,
  .preview-toolbar button .preview-icon-role {
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
    color: var(--preview-on-surface-container-variant);
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-metric strong {
    color: var(--preview-on-surface-container);
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
    background: var(--preview-surface-container-low);
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
    color: var(--preview-on-surface-container-variant);
    font-weight: 400;
  }

  .preview-filter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
  }

  .preview-validation-field {
    display: grid;
    gap: 5px;
    margin-top: 13px;
  }

  .preview-validation-label {
    color: var(--preview-role-on-action);
  }

  .preview-validation-helper {
    width: fit-content;
    border-radius: 4px;
    padding: 4px 6px;
    background: var(--preview-role-action-container);
    color: var(--preview-role-on-action-container);
  }

  .preview-validation-input {
    display: flex;
    min-height: 31px;
    align-items: center;
    border: 1px solid var(--preview-role-outline);
    border-radius: 4px;
    padding: 0 9px;
    background: var(--preview-surface-container-lowest);
    color: var(--preview-on-surface);
    font-weight: 500;
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
    color: var(--preview-on-surface-container);
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
    border: 1px solid var(--preview-primary);
    border-radius: 999px;
    padding: 4px 7px;
    background: var(--preview-primary-container);
    color: var(--preview-on-primary-container);
    font-size: 8px;
  }

  .preview-summary {
    display: grid;
    gap: 2px;
    margin-top: 12px;
    border-radius: 4px;
    padding: 10px;
    background: var(--preview-surface-container-high);
    color: var(--preview-on-surface-container);
  }

  .preview-summary strong {
    font-size: 17px;
  }

  .preview-summary small {
    color: var(--preview-on-surface-container-variant);
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

  .preview-collection-progress {
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

  .preview-alert {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
    gap: 9px;
    padding: 10px 12px;
    background: var(--preview-role-action-container);
    color: var(--preview-role-on-action-container);
    border-bottom: 1px solid var(--preview-role-action);
  }

  .preview-alert-icon {
    width: 16px;
    height: 16px;
    color: var(--preview-role-on-action-container);
  }

  .preview-alert > div {
    display: grid;
    min-width: 0;
    gap: 2px;
  }

  .preview-alert-body {
    font-size: 9px;
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
  .preview-settlement,
  .preview-primary-example {
    border-radius: 4px;
    padding: 12px;
  }

  .preview-reconciliation {
    background: var(--preview-surface-container);
  }

  .preview-settlement {
    background: var(--preview-surface-bright);
  }

  .preview-primary-example {
    border: 1px solid var(--preview-role-outline, var(--preview-primary-outline));
    background: var(--preview-role-surface, var(--preview-primary-surface-bright));
    color: var(--preview-role-on-surface, var(--preview-primary-on-surface));
  }

  .preview-primary-example-inverse {
    border-color: var(--preview-role-outline, var(--preview-primary-outline));
    background: var(--preview-role-surface, var(--preview-primary-inverse-surface));
    color: var(--preview-role-on-surface, var(--preview-primary-on-inverse));
  }

  .preview-primary-example-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .preview-primary-example-heading > div {
    display: grid;
    gap: 3px;
  }

  .preview-primary-example-eyebrow {
    color: var(--preview-role-on-surface-variant, var(--preview-primary-on-surface-variant));
    font-size: 8px;
  }

  .preview-primary-example-inverse .preview-primary-example-eyebrow {
    color: inherit;
    opacity: 0.76;
  }

  .preview-primary-example-heading .preview-primary-example-icon {
    width: 18px;
    height: 18px;
  }

  .preview-primary-example-status {
    border: 1px solid var(--preview-role-outline, var(--preview-primary-outline));
    border-radius: 999px;
    padding: 4px 7px;
    font-size: 8px;
    font-weight: 700;
  }

  .preview-primary-example-body {
    display: flex;
    min-height: 76px;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    border: 1px solid var(--preview-role-outline-variant, var(--preview-primary-outline-variant));
    border-radius: 4px;
    background: var(--preview-role-container, transparent);
    color: var(--preview-role-on-container, var(--preview-role-on-surface));
    padding: 12px;
  }

  .preview-primary-example-inverse .preview-primary-example-body {
    border-color: var(--preview-role-outline, var(--preview-primary-outline));
    background: transparent;
    color: var(--preview-role-on-surface, var(--preview-primary-on-inverse));
  }

  .preview-primary-example-body > .preview-primary-example-icon {
    width: 26px;
    height: 26px;
  }

  .preview-primary-example-body > div {
    display: grid;
    flex: 1;
    gap: 3px;
  }

  .preview-primary-example-helper {
    color: var(--preview-role-on-container-variant, var(--preview-primary-on-surface-variant));
    font-size: 8px;
  }

  .preview-primary-example-inverse .preview-primary-example-helper {
    color: inherit;
    opacity: 0.76;
  }

  .preview-primary-example-rule {
    width: 42px;
    height: 1px;
    background: var(--preview-role-outline-variant, var(--preview-primary-outline-variant));
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
    color: var(--preview-on-surface-container);
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
    background: var(--preview-surface-container-low);
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

  .preview-health-progress {
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
    color: var(--preview-on-surface-container);
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
