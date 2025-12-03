import type { TonalStep } from '@/utils/tonal/scale';

export type PairingSelection = {
  base: TonalStep;
  darker3: TonalStep | null;
  darker45: TonalStep | null;
  lighter3: TonalStep | null;
  lighter45: TonalStep | null;
} | null;
