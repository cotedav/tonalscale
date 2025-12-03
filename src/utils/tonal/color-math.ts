import { clamp } from '../collection';
import { hexToRgb, rgbToHex, type RgbColor } from '../color';

type XyzColor = { x: number; y: number; z: number };

type LabColor = { l: number; a: number; b: number };

type HslColor = { h: number; s: number; l: number };

type HsvColor = { h: number; s: number; v: number };

const LAB_REF_WHITE: XyzColor = { x: 0.95047, y: 1, z: 1.08883 };

const blendModeNames = [
  'colordodge',
  'overlay',
  'softlight',
  'darken',
  'multiply',
  'colorburn',
  'lighten',
  'screen',
  'hardlight',
  'vividlight',
  'hue',
] as const;

export type BlendMode = (typeof blendModeNames)[number];

export const BLEND_MODES: ReadonlySet<BlendMode> = new Set(blendModeNames);

const pivotRgb = (value: number): number =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const pivotXyz = (value: number): number =>
  value > 216 / 24389 ? Math.cbrt(value) : (value * (24389 / 27) + 16) / 116;

const pivotLab = (value: number): number => {
  const valueCubed = value ** 3;
  return valueCubed > 216 / 24389 ? valueCubed : (116 * value - 16) / (24389 / 27);
};

const clampRgb = (value: number): number => clamp(Math.round(value), 0, 255);

const rgbToXyz = ({ r, g, b }: RgbColor): XyzColor => {
  const rLinear = pivotRgb(r / 255);
  const gLinear = pivotRgb(g / 255);
  const bLinear = pivotRgb(b / 255);

  return {
    x: rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375,
    y: rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175,
    z: rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041,
  };
};

const xyzToRgb = ({ x, y, z }: XyzColor): RgbColor => {
  const rLinear = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  const gLinear = x * -0.969266 + y * 1.8760108 + z * 0.041556;
  const bLinear = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  const transform = (value: number) =>
    value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;

  return {
    r: clampRgb(transform(rLinear) * 255),
    g: clampRgb(transform(gLinear) * 255),
    b: clampRgb(transform(bLinear) * 255),
  };
};

export const rgbToLab = (rgb: RgbColor): LabColor => {
  const xyz = rgbToXyz(rgb);

  const x = pivotXyz(xyz.x / LAB_REF_WHITE.x);
  const y = pivotXyz(xyz.y / LAB_REF_WHITE.y);
  const z = pivotXyz(xyz.z / LAB_REF_WHITE.z);

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
};

export const labToRgb = (lab: LabColor): RgbColor => {
  const y = (lab.l + 16) / 116;
  const x = lab.a / 500 + y;
  const z = y - lab.b / 200;

  const xyz = {
    x: LAB_REF_WHITE.x * pivotLab(x),
    y: LAB_REF_WHITE.y * pivotLab(y),
    z: LAB_REF_WHITE.z * pivotLab(z),
  };

  return xyzToRgb(xyz);
};

export const rgbToHsl = ({ r, g, b }: RgbColor): HslColor => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      default:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
};

const hueToRgb = (p: number, q: number, t: number): number => {
  let tAdjusted = t;
  if (tAdjusted < 0) tAdjusted += 1;
  if (tAdjusted > 1) tAdjusted -= 1;
  if (tAdjusted < 1 / 6) return p + (q - p) * 6 * tAdjusted;
  if (tAdjusted < 1 / 2) return q;
  if (tAdjusted < 2 / 3) return p + (q - p) * (2 / 3 - tAdjusted) * 6;
  return p;
};

export const hslToRgb = ({ h, s, l }: HslColor): RgbColor => {
  if (s === 0) {
    const channel = clampRgb(l * 255);
    return { r: channel, g: channel, b: channel };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: clampRgb(hueToRgb(p, q, h + 1 / 3) * 255),
    g: clampRgb(hueToRgb(p, q, h) * 255),
    b: clampRgb(hueToRgb(p, q, h - 1 / 3) * 255),
  };
};

export const rgbToHsv = ({ r, g, b }: RgbColor): HsvColor => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  switch (max) {
    case min:
      h = 0;
      break;
    case rNorm:
      h = (gNorm - bNorm + delta * (gNorm < bNorm ? 6 : 0)) / (6 * delta);
      break;
    case gNorm:
      h = (bNorm - rNorm + 2 * delta) / (6 * delta);
      break;
    default:
      h = (rNorm - gNorm + 4 * delta) / (6 * delta);
      break;
  }

  return { h, s, v };
};

export const hsvToRgb = ({ h, s, v }: HsvColor): RgbColor => {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return { r: clampRgb(r * 255), g: clampRgb(g * 255), b: clampRgb(b * 255) };
};

export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);

  const normalize = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(normalize);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const normalizeHexRgb = (hex: string): RgbColor => hexToRgb(hex);

export const toHex = (rgb: RgbColor): string => rgbToHex(rgb);
