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
  | 'inverse_on_surface'
  | 'on_surface'
  | 'on_surface_variant'
  | 'on_surface_container'
  | 'on_surface_container_variant'
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
  'inverse_on_surface',
  'on_surface',
  'on_surface_variant',
  'on_surface_container',
  'on_surface_container_variant',
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
      inverse_on_surface: 98,
      on_surface: 10,
      on_surface_variant: 35,
      on_surface_container: 10,
      on_surface_container_variant: 35,
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
      inverse_on_surface: 98,
      on_surface: 10,
      on_surface_variant: 35,
      on_surface_container: 10,
      on_surface_container_variant: 35,
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
      inverse_on_surface: 98,
      on_surface: 10,
      on_surface_variant: 35,
      on_surface_container: 10,
      on_surface_container_variant: 35,
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
      inverse_on_surface: 20,
      on_surface: 90,
      on_surface_variant: 80,
      on_surface_container: 90,
      on_surface_container_variant: 80,
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
      inverse_on_surface: 20,
      on_surface: 90,
      on_surface_variant: 80,
      on_surface_container: 90,
      on_surface_container_variant: 80,
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
      inverse_on_surface: 20,
      on_surface: 90,
      on_surface_variant: 80,
      on_surface_container: 90,
      on_surface_container_variant: 80,
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

const excludeTone = (tones: TonalStep[], excludedTone?: number | null) => {
  if (excludedTone === undefined || excludedTone === null) return tones;
  const filteredTones = tones.filter((tone) => tone.index !== excludedTone);
  return filteredTones.length ? filteredTones : tones;
};

const nearestIndexPosition = (indices: number[], tone: number) =>
  Math.max(0, indices.indexOf(nearestAvailableTone(indices, tone)));

const oppositeDirection = (direction: ContrastDirection): ContrastDirection =>
  direction === 'darker' ? 'lighter' : 'darker';

const findContrastToneIndex = (
  tones: TonalStep[],
  basePosition: number,
  direction: ContrastDirection,
  ratio: number,
) =>
  findClosestContrastTone(tones, basePosition, direction, ratio)?.tone.index ??
  findClosestContrastTone(tones, basePosition, oppositeDirection(direction), ratio)?.tone.index;

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
  const containerTones = [
    roleTones.container_lowest,
    roleTones.container_low,
    roleTones.container,
    roleTones.container_high,
    roleTones.container_highest,
  ];
  const containerAnchorTone = Math.min(...containerTones);
  const containerPosition = sortedTones.findIndex((tone) => tone.index === containerAnchorTone);
  const inversePosition = sortedTones.findIndex((tone) => tone.index === roleTones.inverse_surface);
  const aaaTone = findContrastToneIndex(sortedTones, surfacePosition, direction, 4.5);
  const aaTone = findContrastToneIndex(sortedTones, surfacePosition, direction, 3);
  const containerAaaTone = findContrastToneIndex(sortedTones, containerPosition, direction, 4.5);
  const containerAaTone = findContrastToneIndex(sortedTones, containerPosition, direction, 3);
  const inverseAaaTone = findContrastToneIndex(
    sortedTones,
    inversePosition,
    oppositeDirection(direction),
    4.5,
  );
  const outlineTone = aaTone ?? roleTones.outline;
  const outlineVariantTone = nearestToneIndex(sortedTones, (roleTones.surface + outlineTone) / 2);

  return {
    ...roleTones,
    inverse_on_surface: inverseAaaTone ?? roleTones.inverse_on_surface,
    on_surface: aaaTone ?? roleTones.on_surface,
    on_surface_variant: aaTone ?? roleTones.on_surface_variant,
    on_surface_container: containerAaaTone ?? roleTones.on_surface_container,
    on_surface_container_variant: containerAaTone ?? roleTones.on_surface_container_variant,
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
  excludedTone,
}: {
  tones: TonalStep[];
  isDarkMode: boolean;
  contrast: SurfaceContrast;
  lightTone: number;
  darkTone: number;
  excludedTone?: number | null;
}): Record<SurfaceToneRole, number> => {
  const assignmentTones = excludeTone(tones, excludedTone);
  const baseTones = getBaseSurfaceTones(isDarkMode, contrast);
  const indices = [...new Set(assignmentTones.map((tone) => tone.index))].sort(
    (left, right) => left - right,
  );
  const defaultSurfaceTone = isDarkMode ? 0 : 100;
  const defaultIndex = nearestIndexPosition(indices, defaultSurfaceTone);
  const selectedIndex = nearestIndexPosition(indices, isDarkMode ? darkTone : lightTone);
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

      const toneIndex = nearestIndexPosition(indices, tone);
      const shiftedIndex = Math.min(Math.max(toneIndex + shift, 0), indices.length - 1);

      return [role, indices[shiftedIndex] ?? tone];
    }),
  ) as Record<SurfaceToneRole, number>;

  Object.entries(shiftedTones).forEach(([role, tone]) => {
    shiftedTones[role as SurfaceToneRole] = nearestAvailableTone(indices, tone);
  });

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
    tones: assignmentTones,
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
  excludedTone,
  isDarkMode = false,
}: {
  tones: TonalStep[];
  contrast: SurfaceContrast;
  surfaceTone: number;
  baseTone: number;
  excludedTone?: number | null;
  isDarkMode?: boolean;
}): Record<SurfaceToneRole, number> => {
  const assignmentTones = excludeTone(tones, excludedTone);
  const fallbackIndices = getUniqueToneIndices(assignmentTones);
  const preferredIndices = fallbackIndices.filter((tone) => tone >= 5 && tone <= 99);
  const scaleIndices = preferredIndices.length ? preferredIndices : fallbackIndices;
  const selectedSurfaceTone = nearestAvailableTone(
    scaleIndices,
    Number.isFinite(surfaceTone) ? surfaceTone : baseTone,
  );
  const surfaceIndex = scaleIndices.indexOf(selectedSurfaceTone);
  const offsets = contrastOffsets[contrast];
  const maxOffset = offsets[offsets.length - 1];
  const hasEnoughPreferredTones = isDarkMode
    ? surfaceIndex - maxOffset >= 0
    : surfaceIndex + maxOffset < scaleIndices.length;
  const shouldScaleDarker = isDarkMode ? hasEnoughPreferredTones : !hasEnoughPreferredTones;
  const toneAtOffset = (offset: number) => {
    const nextIndex = shouldScaleDarker ? surfaceIndex - offset : surfaceIndex + offset;
    return scaleIndices[Math.min(Math.max(nextIndex, 0), scaleIndices.length - 1)];
  };
  const containers = {
    container_lowest: toneAtOffset(offsets[0]),
    container_low: toneAtOffset(offsets[1]),
    container: toneAtOffset(offsets[2]),
    container_high: toneAtOffset(offsets[3]),
    container_highest: toneAtOffset(offsets[4]),
  };
  const surfaceFamilyTones = [selectedSurfaceTone, ...Object.values(containers)];
  const isLightSurface = selectedSurfaceTone >= 60;

  const roleTones = {
    surface: selectedSurfaceTone,
    surface_bright: Math.max(...surfaceFamilyTones),
    surface_dim: Math.min(...surfaceFamilyTones),
    ...containers,
    inverse_surface: isDarkMode
      ? nearestAvailableTone(fallbackIndices, 90)
      : nearestAvailableTone(fallbackIndices, 20),
    inverse_on_surface: isDarkMode
      ? nearestAvailableTone(fallbackIndices, 20)
      : nearestAvailableTone(fallbackIndices, 98),
    on_surface: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 10)
      : nearestAvailableTone(fallbackIndices, 95),
    on_surface_variant: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 35)
      : nearestAvailableTone(fallbackIndices, 80),
    on_surface_container: isLightSurface
      ? nearestAvailableTone(fallbackIndices, 10)
      : nearestAvailableTone(fallbackIndices, 95),
    on_surface_container_variant: isLightSurface
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
    tones: assignmentTones,
    roleTones,
    direction: isLightSurface ? 'darker' : 'lighter',
  });
};
