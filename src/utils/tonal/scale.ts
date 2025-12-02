import { clamp } from '../collection';
import { type RgbColor } from '../color';
import { applyBlend, applySaturation } from './blending';
import { easeInOutQuad, getIntensity, getIntensityCurve } from './easing';
import { labToRgb, normalizeHexRgb, rgbToLab, toHex, type BlendMode } from './color-math';

export type TonalScaleParams = {
  colorHex: string;
  blendMode: BlendMode;
  blendStrength: number; // 0-100
  blendR: number; // 0-255
  blendG: number; // 0-255
  blendB: number; // 0-255
  middle: number; // -50 to 50 slider mapped later
  spread: number; // 0-100
  satDarker: number; // 0-100
  satLighter: number; // 0-100
};

export type TonalStep = { index: number; hex: string };

export type TonalScale = { colorScale: TonalStep[]; luminance: number };

const scaleChroma = (labComponent: number, targetLightness: number, luminance: number): number => {
  if (targetLightness < luminance) {
    return (targetLightness / luminance) * labComponent;
  }
  if (targetLightness > luminance) {
    return ((100 - targetLightness) / (100 - luminance)) * labComponent;
  }
  return labComponent;
};

const toNormalized = (value: number): number => clamp(value / 255, 0, 1);

export const generateTonalScale = (params: TonalScaleParams): TonalScale => {
  const baseRgb = normalizeHexRgb(params.colorHex);
  const baseLab = rgbToLab(baseRgb);
  const luminance = Math.round(baseLab.l);

  const blendEnabled =
    params.blendStrength > 0 && (params.blendR > 0 || params.blendG > 0 || params.blendB > 0);
  const saturationDarkerEnabled = params.satDarker > 0;
  const saturationLighterEnabled = params.satLighter > 0;
  const normalizedBlend = {
    r: toNormalized(params.blendR),
    g: toNormalized(params.blendG),
    b: toNormalized(params.blendB),
  };

  const intensityCurve = blendEnabled
    ? getIntensityCurve((params.middle + 50) / 100, params.spread / 100)
    : null;

  const colorScale: TonalStep[] = [];

  for (let i = 0; i <= 100; i += 1) {
    const adjustedLab = {
      l: i,
      a: scaleChroma(baseLab.a, i, luminance),
      b: scaleChroma(baseLab.b, i, luminance),
    };

    let adjustedRgb: RgbColor = labToRgb(adjustedLab);

    if (i === luminance) {
      adjustedRgb = baseRgb;
    } else if (i < luminance) {
      if (blendEnabled && intensityCurve) {
        const intensity = getIntensity(intensityCurve, i, luminance - 1);
        adjustedRgb = applyBlend(
          adjustedRgb,
          params.blendMode,
          params.blendStrength / 100,
          normalizedBlend.r,
          normalizedBlend.g,
          normalizedBlend.b,
          intensity,
        );
      }

      if (saturationDarkerEnabled) {
        adjustedRgb = applySaturation(
          adjustedRgb,
          params.satDarker / 100,
          easeInOutQuad(luminance, i),
        );
      }
    } else if (i > luminance && saturationLighterEnabled) {
      const intensity = easeInOutQuad(100 - luminance, i - luminance);
      adjustedRgb = applySaturation(adjustedRgb, params.satLighter / 100, intensity);
    }

    colorScale.push({ index: i, hex: toHex(adjustedRgb) });
  }

  return { colorScale, luminance };
};
