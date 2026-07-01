import { describe, expect, it } from 'vitest';
import { applyBlend, applySaturation } from '@/utils/tonal/blending';
import { cubicBezier, easeInOutQuad, getIntensity, getIntensityCurve } from '@/utils/tonal/easing';
import { generateTonalScale, type TonalScaleParams } from '@/utils/tonal/scale';
import { normalizeHexRgb, rgbToHsl, rgbToLab } from '@/utils/tonal/color-math';
import { buildAccentSurfaceRoleTones, buildSurfaceRoleTones } from '@/utils/tonal/surface-roles';

describe('blending', () => {
  it('blends overlay mode with expected result', () => {
    const blended = applyBlend({ r: 120, g: 160, b: 200 }, 'overlay', 0.5, 0.2, 0.4, 0.6, 0.8);
    expect(blended).toEqual({ r: 91, g: 152, b: 204 });
  });

  it('blends hue mode by adopting hue while keeping lightness/saturation', () => {
    const baseHsl = rgbToHsl({ r: 50, g: 100, b: 150 });
    const blended = applyBlend({ r: 50, g: 100, b: 150 }, 'hue', 1, 0.8, 0.1, 0.2, 1);
    const blendedHsl = rgbToHsl(blended);

    expect(blendedHsl.l).toBeCloseTo(baseHsl.l, 4);
    expect(blendedHsl.s).toBeCloseTo(baseHsl.s, 4);
    expect(blendedHsl.h).not.toBeCloseTo(baseHsl.h, 4);
  });

  it('throws when blend channels are out of range', () => {
    expect(() => applyBlend({ r: 0, g: 0, b: 0 }, 'screen', 1.2, 0, 0, 0, 0.5)).toThrow(RangeError);
    expect(() => applyBlend({ r: 0, g: 0, b: 0 }, 'screen', 0.5, -0.1, 0, 0, 0.5)).toThrow(
      RangeError,
    );
    expect(() => applyBlend({ r: 0, g: 0, b: 0 }, 'screen', 0.5, 0, 0, 0, 1.2)).toThrow(RangeError);
  });

  it('throws when saturation inputs are out of range', () => {
    expect(() => applySaturation({ r: 10, g: 20, b: 30 }, 1.1, 0.5)).toThrow(RangeError);
    expect(() => applySaturation({ r: 10, g: 20, b: 30 }, 0.5, -0.1)).toThrow(RangeError);
  });
});

describe('easing', () => {
  it('produces symmetric easeInOutQuad curve', () => {
    expect(easeInOutQuad(100, 25)).toBeCloseTo(easeInOutQuad(100, 75));
    expect(easeInOutQuad(100, 50)).toBeCloseTo(1);
  });

  it('builds cubic bezier values for midpoint', () => {
    const curve = cubicBezier(0.42, 0, 0.58, 1);
    const midpoint = curve(0.5);
    expect(midpoint.x).toBeGreaterThan(0.45);
    expect(midpoint.x).toBeLessThan(0.55);
    expect(midpoint.y).toBeGreaterThan(0.4);
  });

  it('returns zero intensity at endpoints and symmetric midpoint', () => {
    const curve = getIntensityCurve(0.5, 0.2);
    expect(getIntensity(curve, 0, 50)).toBe(0);
    expect(getIntensity(curve, 50, 50)).toBe(0);
    const low = getIntensity(curve, 10, 50);
    const high = getIntensity(curve, 40, 50);
    expect(low).toBeCloseTo(high, 5);
  });
});

describe('generateTonalScale', () => {
  const params: TonalScaleParams = {
    colorHex: '#7d4bff',
    blendMode: 'overlay',
    blendStrength: 65,
    blendR: 237,
    blendG: 115,
    blendB: 95,
    middle: 10,
    spread: 20,
    satDarker: 35,
    satLighter: 15,
  };

  const scale = generateTonalScale(params);

  it('creates a 101-step scale with rounded luminance', () => {
    expect(scale.colorScale).toHaveLength(101);
    expect(scale.luminance).toBeGreaterThanOrEqual(0);
    expect(scale.luminance).toBeLessThanOrEqual(100);
  });

  it('returns base color at the luminance index', () => {
    const hexAtLuminance = scale.colorScale.find((step) => step.index === scale.luminance)?.hex;
    expect(hexAtLuminance).toBeDefined();
    expect(hexAtLuminance?.toLowerCase()).toBe(params.colorHex);
  });

  it('produces expected endpoints', () => {
    expect(scale.colorScale[0]).toEqual({ index: 0, hex: '#000000' });
    expect(scale.colorScale[100]).toEqual({ index: 100, hex: '#ffffff' });
  });

  it('builds unblended LAB ramps when blend and saturation controls are zeroed', () => {
    const noBlendParams: TonalScaleParams = {
      colorHex: '#7d4bff',
      blendMode: 'overlay',
      blendStrength: 0,
      blendR: 0,
      blendG: 0,
      blendB: 0,
      middle: 0,
      spread: 50,
      satDarker: 0,
      satLighter: 0,
    };

    const unblended = generateTonalScale(noBlendParams);
    const baseLab = rgbToLab(normalizeHexRgb(noBlendParams.colorHex));
    const baseStep = unblended.colorScale.find((step) => step.index === unblended.luminance);

    expect(baseStep?.hex.toLowerCase()).toBe(noBlendParams.colorHex);
    expect(unblended.colorScale[0]).toEqual({ index: 0, hex: '#000000' });
    expect(unblended.colorScale[100]).toEqual({ index: 100, hex: '#ffffff' });

    const chromaAt = (index: number) => {
      const lab = rgbToLab(normalizeHexRgb(unblended.colorScale[index].hex));
      return Math.hypot(lab.a, lab.b);
    };

    const baseChroma = Math.hypot(baseLab.a, baseLab.b);
    const darkerNear = chromaAt(Math.max(unblended.luminance - 5, 0));
    const darkerFar = chromaAt(Math.max(unblended.luminance - 25, 0));
    const lighterNear = chromaAt(Math.min(unblended.luminance + 5, 100));
    const lighterFar = chromaAt(Math.min(unblended.luminance + 25, 100));

    expect(darkerFar).toBeLessThan(darkerNear);
    expect(lighterFar).toBeLessThan(lighterNear);
    expect(Math.abs(darkerNear - lighterNear)).toBeLessThan(baseChroma * 0.1);
  });
});

describe('accent surface roles', () => {
  const tones = Array.from({ length: 101 }, (_, index) => ({
    index,
    hex: `#${index.toString().padStart(6, '0')}`,
  }));

  it('keeps the lowest container closest to the surface when containers must scale darker', () => {
    const roles = buildAccentSurfaceRoleTones({
      tones,
      contrast: 'low',
      surfaceTone: 98,
      baseTone: 50,
    });

    expect(roles.surface).toBe(98);
    expect(roles.container_lowest).toBe(97);
    expect(roles.container_low).toBe(96);
    expect(roles.container).toBe(95);
    expect(roles.container_high).toBe(94);
    expect(roles.container_highest).toBe(93);
  });

  it('ignores the base-adjacent tone when assigning accent surface roles', () => {
    const roles = buildAccentSurfaceRoleTones({
      tones,
      contrast: 'low',
      surfaceTone: 43,
      baseTone: 43,
      excludedTone: 40,
    });

    expect(Object.values(roles)).not.toContain(40);
  });

  it('keeps accent surface anchored while containers and inverse roles respond to dark mode', () => {
    const lightRoles = buildAccentSurfaceRoleTones({
      tones,
      contrast: 'low',
      surfaceTone: 40,
      baseTone: 40,
      isDarkMode: false,
    });
    const darkRoles = buildAccentSurfaceRoleTones({
      tones,
      contrast: 'low',
      surfaceTone: 40,
      baseTone: 40,
      isDarkMode: true,
    });

    expect(lightRoles.surface).toBe(40);
    expect(darkRoles.surface).toBe(40);
    expect(lightRoles.container_lowest).toBeGreaterThan(lightRoles.surface);
    expect(darkRoles.container_lowest).toBeLessThan(darkRoles.surface);
    expect(lightRoles.inverse_surface).toBe(20);
    expect(darkRoles.inverse_surface).toBe(90);
  });
});

describe('surface foreground roles', () => {
  it('falls back to the opposite direction when no preferred AAA tone exists', () => {
    const roles = buildSurfaceRoleTones({
      tones: [
        { index: 80, hex: '#ffffff' },
        { index: 90, hex: '#f6f6f6' },
        { index: 100, hex: '#000000' },
      ],
      isDarkMode: false,
      contrast: 'low',
      lightTone: 80,
      darkTone: 0,
    });

    expect(roles.on_surface).toBe(100);
    expect(roles.on_surface_container).toBe(100);
  });

  it('ignores the base-adjacent tone when assigning surface roles', () => {
    const toneIndices = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
    const tones = toneIndices.map((index) => ({
      index,
      hex: `#${index.toString().padStart(6, '0')}`,
    }));
    const roles = buildSurfaceRoleTones({
      tones,
      isDarkMode: false,
      contrast: 'high',
      lightTone: 100,
      darkTone: 0,
      excludedTone: 40,
    });

    expect(Object.values(roles)).not.toContain(40);
  });
});
