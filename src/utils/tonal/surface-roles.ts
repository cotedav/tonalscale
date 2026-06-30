import type { SurfaceContrast } from '@/stores/tonalScale';
import { findClosestContrastTone, type ContrastDirection } from '@/utils/tonal/contrast';
import type { TonalStep } from '@/utils/tonal/scale';

export type SurfaceToneRole =
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

export const SURFACE_TONE_ROLES: SurfaceToneRole[] = [
  'surface',
  'surface_bright',
  'surface_dim',
  'container_lowest',
  'container_low',
  'container',
  'container_high',
  'container_highest',
  'inverse_surface',
  'on_surface',
  'on_surface_variant',
  'outline',
  'outline_variant',
];

const getBaseSurfaceTones = (
  isDarkMode: boolean,
  contrast: SurfaceContrast,
): Record<SurfaceToneRole, number> => {
  const lightMappings: Record<SurfaceContrast, Record<SurfaceToneRole, number>> = {
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
  const darkMappings: Record<SurfaceContrast, Record<SurfaceToneRole, number>> = {
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

  return (isDarkMode ? darkMappings : lightMappings)[contrast];
};

const getUniqueToneIndices = (tones: TonalStep[]) =>
  [...new Set(tones.map((tone) => tone.index))].sort((left, right) => left - right);

const nearestAvailableTone = (indices: number[], targetTone: number) =>
  indices.reduce((nearest, tone) =>
    Math.abs(tone - targetTone) < Math.abs(nearest - targetTone) ? tone : nearest,
  );

const sortedUniqueTones = (tones: TonalStep[]) =>
  [...new Map(tones.map((tone) => [tone.index, tone])).values()].sort(
    (left, right) => left.index - right.index,
  );

const nearestToneIndex = (tones: TonalStep[], targetTone: number) =>
  nearestAvailableTone(
    tones.map((tone) => tone.index),
    targetTone,
  );

function applyContrastSurfaceRoles({
  tones,
  roleTones,
  direction,
}: {
  tones: TonalStep[];
  roleTones: Record<SurfaceToneRole, number>;
  direction: ContrastDirection;
}) {
  const sortedTones = sortedUniqueTones(tones);
  const surfacePosition = sortedTones.findIndex((tone) => tone.index === roleTones.surface);
  const aaaTone = findClosestContrastTone(sortedTones, surfacePosition, direction, 4.5)?.tone.index;
  const aaTone = findClosestContrastTone(sortedTones, surfacePosition, direction, 3)?.tone.index;
  const outlineTone = aaTone ?? roleTones.outline;
  const outlineVariantTone = nearestToneIndex(sortedTones, (roleTones.surface + outlineTone) / 2);

  return {
    ...roleTones,
    on_surface: aaaTone ?? roleTones.on_surface,
    on_surface_variant: aaTone ?? roleTones.on_surface_variant,
    outline: outlineTone,
    outline_variant: outlineVariantTone,
  };
}

export const buildSurfaceRoleTones = ({
  tones,
  isDarkMode,
  contrast,
  lightTone,
  darkTone,
}: {
  tones: TonalStep[];
  isDarkMode: boolean;
  contrast: SurfaceContrast;
  lightTone: number;
  darkTone: number;
}): Record<SurfaceToneRole, number> => {
  const baseTones = getBaseSurfaceTones(isDarkMode, contrast);
  const indices = [...new Set(tones.map((tone) => tone.index))].sort((left, right) => left - right);
  const defaultSurfaceTone = isDarkMode ? 0 : 100;
  const defaultIndex = indices.indexOf(defaultSurfaceTone);
  const selectedIndex = indices.indexOf(isDarkMode ? darkTone : lightTone);
  const shift = selectedIndex - defaultIndex;
  const shiftedRoles: SurfaceToneRole[] = [
    'surface',
    'container_lowest',
    'container_low',
    'container',
    'container_high',
    'container_highest',
  ];

  const shiftedTones = Object.fromEntries(
    Object.entries(baseTones).map(([role, tone]) => {
      if (!shiftedRoles.includes(role as SurfaceToneRole)) return [role, tone];

      const toneIndex = indices.indexOf(tone);
      const shiftedIndex = Math.min(Math.max(toneIndex + shift, 0), indices.length - 1);

      return [role, indices[shiftedIndex] ?? tone];
    }),
  ) as Record<SurfaceToneRole, number>;

  const surfaceFamilyTones = [
    shiftedTones.surface,
    shiftedTones.container_lowest,
    shiftedTones.container_low,
    shiftedTones.container,
    shiftedTones.container_high,
    shiftedTones.container_highest,
  ];

  shiftedTones.surface_bright = Math.max(...surfaceFamilyTones);
  shiftedTones.surface_dim = Math.min(...surfaceFamilyTones);

  return applyContrastSurfaceRoles({
    tones,
    roleTones: shiftedTones,
    direction: isDarkMode ? 'lighter' : 'darker',
  });
};

const contrastOffsets: Record<SurfaceContrast, number[]> = {
  low: [1, 2, 3, 4, 5],
  medium: [1, 2, 4, 6, 8],
  high: [1, 3, 6, 9, 12],
};

export const buildAccentSurfaceRoleTones = ({
  tones,
  contrast,
  surfaceTone,
  baseTone,
}: {
  tones: TonalStep[];
  contrast: SurfaceContrast;
  surfaceTone: number;
  baseTone: number;
}): Record<SurfaceToneRole, number> => {
  const indices = getUniqueToneIndices(tones).filter((tone) => tone >= 10 && tone <= 99);
  const fallbackIndices = getUniqueToneIndices(tones);
  const scaleIndices = indices.length ? indices : fallbackIndices;
  const selectedSurfaceTone = nearestAvailableTone(scaleIndices, surfaceTone || baseTone);
  const surfaceIndex = scaleIndices.indexOf(selectedSurfaceTone);
  const offsets = contrastOffsets[contrast];
  const hasEnoughLighterTones = surfaceIndex + offsets[offsets.length - 1] < scaleIndices.length;
  const toneAtOffset = (offset: number) => {
    const nextIndex = hasEnoughLighterTones ? surfaceIndex + offset : surfaceIndex - offset;
    return scaleIndices[Math.min(Math.max(nextIndex, 0), scaleIndices.length - 1)];
  };
  const lighterContainers = {
    container_lowest: toneAtOffset(offsets[0]),
    container_low: toneAtOffset(offsets[1]),
    container: toneAtOffset(offsets[2]),
    container_high: toneAtOffset(offsets[3]),
    container_highest: toneAtOffset(offsets[4]),
  };
  const darkerContainers = {
    container_lowest: toneAtOffset(offsets[0]),
    container_low: toneAtOffset(offsets[1]),
    container: toneAtOffset(offsets[2]),
    container_high: toneAtOffset(offsets[3]),
    container_highest: toneAtOffset(offsets[4]),
  };
  const containers = hasEnoughLighterTones ? lighterContainers : darkerContainers;
  const surfaceFamilyTones = [selectedSurfaceTone, ...Object.values(containers)];
  const isLightSurface = selectedSurfaceTone >= 60;

  const roleTones = {
    surface: selectedSurfaceTone,
    surface_bright: Math.max(...surfaceFamilyTones),
    surface_dim: Math.min(...surfaceFamilyTones),
    ...containers,
    inverse_surface: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 20)
      : nearestAvailableTone(fallbackIndices, 90),
    on_surface: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 10)
      : nearestAvailableTone(fallbackIndices, 95),
    on_surface_variant: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 35)
      : nearestAvailableTone(fallbackIndices, 80),
    outline: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 50)
      : nearestAvailableTone(fallbackIndices, 60),
    outline_variant: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 80)
      : nearestAvailableTone(fallbackIndices, 30),
  };

  return applyContrastSurfaceRoles({
    tones,
    roleTones,
    direction: isLightSurface ? 'darker' : 'lighter',
  });
};
