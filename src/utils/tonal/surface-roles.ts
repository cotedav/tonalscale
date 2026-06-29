import type { SurfaceContrast } from '@/stores/tonalScale';
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
    'on_surface',
    'on_surface_variant',
    'outline',
    'outline_variant',
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

  return shiftedTones;
};
