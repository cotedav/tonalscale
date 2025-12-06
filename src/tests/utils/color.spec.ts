import { describe, it, expect } from 'vitest';
import {
  isValidHex,
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  hexToHsv,
} from '@/utils/color';

describe('utils/color', () => {
  describe('isValidHex', () => {
    it('returns true for valid hex strings', () => {
      expect(isValidHex('#fff')).toBe(true);
      expect(isValidHex('#ffffff')).toBe(true);
      expect(isValidHex('fff')).toBe(true);
      expect(isValidHex('ffffff')).toBe(true);
      expect(isValidHex('#000000')).toBe(true);
      expect(isValidHex('#ABCDEF')).toBe(true);
    });

    it('returns false for invalid hex strings', () => {
      expect(isValidHex('#ff')).toBe(false);
      expect(isValidHex('#ffff')).toBe(false);
      expect(isValidHex('#fffffff')).toBe(false);
      expect(isValidHex('zzzzzz')).toBe(false);
      expect(isValidHex('')).toBe(false);
    });
  });

  describe('normalizeHex', () => {
    it('expands 3-digit hex to 6-digit', () => {
      expect(normalizeHex('#f00')).toBe('#ff0000');
      expect(normalizeHex('0f0')).toBe('#00ff00');
      expect(normalizeHex('#123')).toBe('#112233');
    });

    it('returns 6-digit hex as is (normalized to lower case)', () => {
      expect(normalizeHex('#FF0000')).toBe('#ff0000');
      expect(normalizeHex('00FF00')).toBe('#00ff00');
      expect(normalizeHex('#123456')).toBe('#123456');
    });

    it('handles input without hash', () => {
      expect(normalizeHex('ABCDEF')).toBe('#abcdef');
    });
  });

  describe('hexToRgb', () => {
    it('converts hex to rgb correctly', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('handles short hex', () => {
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('rgbToHex', () => {
    it('converts rgb to hex correctly', () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
    });

    it('clamps values', () => {
      expect(rgbToHex({ r: 300, g: -50, b: 128 })).toBe('#ff0080');
    });

    it('rounds values', () => {
      expect(rgbToHex({ r: 100.5, g: 100.2, b: 99.9 })).toBe('#656464');
    });
  });

  describe('rgbToHsv', () => {
    it('converts black', () => {
      expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 });
    });

    it('converts white', () => {
      expect(rgbToHsv({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, v: 100 });
    });

    it('converts red', () => {
      expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, v: 100 });
    });

    it('converts green', () => {
      expect(rgbToHsv({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, v: 100 });
    });

    it('converts blue', () => {
      expect(rgbToHsv({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, v: 100 });
    });

    it('converts mixed color (cyan)', () => {
      expect(rgbToHsv({ r: 0, g: 255, b: 255 })).toEqual({ h: 180, s: 100, v: 100 });
    });

    it('converts mixed color (magenta)', () => {
      expect(rgbToHsv({ r: 255, g: 0, b: 255 })).toEqual({ h: 300, s: 100, v: 100 });
    });

    it('converts mixed color (yellow)', () => {
      expect(rgbToHsv({ r: 255, g: 255, b: 0 })).toEqual({ h: 60, s: 100, v: 100 });
    });
  });

  describe('hsvToRgb', () => {
    it('converts black', () => {
      expect(hsvToRgb({ h: 0, s: 0, v: 0 })).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('converts white', () => {
      expect(hsvToRgb({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('converts red', () => {
      expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('converts green', () => {
      expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('converts blue', () => {
      expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('handles hue ranges', () => {
      // 0 <= h < 60 (Red to Yellow)
      expect(hsvToRgb({ h: 30, s: 100, v: 100 })).toEqual({ r: 255, g: 128, b: 0 });
      // 60 <= h < 120 (Yellow to Green)
      expect(hsvToRgb({ h: 90, s: 100, v: 100 })).toEqual({ r: 128, g: 255, b: 0 });
      // 120 <= h < 180 (Green to Cyan)
      expect(hsvToRgb({ h: 150, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 128 });
      // 180 <= h < 240 (Cyan to Blue)
      expect(hsvToRgb({ h: 210, s: 100, v: 100 })).toEqual({ r: 0, g: 128, b: 255 });
      // 240 <= h < 300 (Blue to Magenta)
      expect(hsvToRgb({ h: 270, s: 100, v: 100 })).toEqual({ r: 128, g: 0, b: 255 });
      // 300 <= h < 360 (Magenta to Red)
      expect(hsvToRgb({ h: 330, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 128 });
    });
  });

  describe('hexToHsv', () => {
    it('converts hex to hsv', () => {
      expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 });
    });
  });
});
