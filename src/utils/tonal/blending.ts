import { clamp } from '../collection';
import { type RgbColor } from '../color';
import { BLEND_MODES, type BlendMode, hslToRgb, rgbToHsl, rgbToHsv, hsvToRgb } from './color-math';

const requireNormalizedChannel = (value: number, label: string): void => {
  if (value < 0 || value > 1 || Number.isNaN(value)) {
    throw new RangeError(`${label} must be between 0 and 1.`);
  }
};

const requireStrength = (value: number): void => {
  if (value < 0 || value > 1 || Number.isNaN(value)) {
    throw new RangeError('Blend strength must be between 0 and 1.');
  }
};

const requireBlendMode = (mode: BlendMode): void => {
  if (!BLEND_MODES.has(mode)) {
    throw new RangeError(`Unsupported blend mode: ${mode}`);
  }
};

const blendOverlay = (a: number, b: number): number =>
  a <= 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
const blendSoftLight = (a: number, b: number): number =>
  b <= 0.5 ? a - (1 - 2 * b) * a * (1 - a) : a + (2 * b - 1) * (Math.sqrt(a) - a);
const blendColorDodge = (a: number, b: number): number => (b < 1 ? Math.min(a / (1 - b), 1) : 1);
const blendDarken = (a: number, b: number): number => Math.min(a, b);
const blendMultiply = (a: number, b: number): number => a * b;
const blendColorBurn = (a: number, b: number): number => (b > 0 ? 1 - Math.min((1 - a) / b, 1) : 0);
const blendLighten = (a: number, b: number): number => Math.max(a, b);
const blendScreen = (a: number, b: number): number => 1 - (1 - a) * (1 - b);
const blendHardLight = (a: number, b: number): number =>
  b <= 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
const blendVividLight = (a: number, b: number): number =>
  b <= 0.5 ? 1 - Math.min((1 - a) / (2 * b), 1) : Math.min(a / (2 * (1 - b)), 1);

const channelBlendMap: Record<Exclude<BlendMode, 'hue'>, (a: number, b: number) => number> = {
  colordodge: blendColorDodge,
  overlay: blendOverlay,
  softlight: blendSoftLight,
  darken: blendDarken,
  multiply: blendMultiply,
  colorburn: blendColorBurn,
  lighten: blendLighten,
  screen: blendScreen,
  hardlight: blendHardLight,
  vividlight: blendVividLight,
};

const applyChannelBlend = (mode: Exclude<BlendMode, 'hue'>, base: number, blend: number): number =>
  channelBlendMap[mode](base, blend);

export const applyBlend = (
  rgb: RgbColor,
  blendMode: BlendMode,
  blendStrength: number,
  blendR: number,
  blendG: number,
  blendB: number,
  intensity: number,
): RgbColor => {
  [blendR, blendG, blendB].forEach((channel, index) =>
    requireNormalizedChannel(channel, ['Red', 'Green', 'Blue'][index]),
  );
  requireNormalizedChannel(intensity, 'Intensity');
  requireStrength(blendStrength);
  requireBlendMode(blendMode);

  if ((blendR === 0 && blendG === 0 && blendB === 0) || intensity === 0 || blendStrength === 0) {
    return rgb;
  }

  if (blendMode === 'hue') {
    const baseHsl = rgbToHsl(rgb);
    const blendHsl = rgbToHsl({
      r: Math.round(blendR * 255),
      g: Math.round(blendG * 255),
      b: Math.round(blendB * 255),
    });
    const hueMixed = hslToRgb({ h: blendHsl.h, s: baseHsl.s, l: baseHsl.l });

    return {
      r: clamp(rgb.r + intensity * blendStrength * (hueMixed.r - rgb.r), 0, 255),
      g: clamp(rgb.g + intensity * blendStrength * (hueMixed.g - rgb.g), 0, 255),
      b: clamp(rgb.b + intensity * blendStrength * (hueMixed.b - rgb.b), 0, 255),
    };
  }

  const blendedRed = applyChannelBlend(blendMode, rgb.r / 255, blendR);
  const blendedGreen = applyChannelBlend(blendMode, rgb.g / 255, blendG);
  const blendedBlue = applyChannelBlend(blendMode, rgb.b / 255, blendB);

  const mixChannel = (base: number, blended: number): number =>
    (base / 255) * (1 - intensity * blendStrength) + blended * intensity * blendStrength;

  return {
    r: clamp(Math.round(mixChannel(rgb.r, blendedRed) * 255), 0, 255),
    g: clamp(Math.round(mixChannel(rgb.g, blendedGreen) * 255), 0, 255),
    b: clamp(Math.round(mixChannel(rgb.b, blendedBlue) * 255), 0, 255),
  };
};

export const applySaturation = (rgb: RgbColor, saturation: number, intensity: number): RgbColor => {
  requireNormalizedChannel(saturation, 'Saturation');
  requireNormalizedChannel(intensity, 'Intensity');

  const hsv = rgbToHsv(rgb);
  const newSaturation = hsv.s + (1 - hsv.s) * saturation * intensity;
  return hsvToRgb({ h: hsv.h, s: newSaturation, v: hsv.v });
};
