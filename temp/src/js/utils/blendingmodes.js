//////////////////////////// ------------- ////////////////////////////
//////////////////////////// BLENDING MODE ////////////////////////////
////////////////////////////---------------////////////////////////////

const blendingModes = {};

blendingModes.colordodge = function (a, b) {
  return b < 1 ? Math.min(a / (1 - b), 1) : 1;
};

blendingModes.overlay = function (a, b) {
  return a <= 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
};

blendingModes.softlight = function (a, b) {
  return b <= 0.5 ? a - (1 - 2 * b) * a * (1 - a) : a + (2 * b - 1) * (Math.sqrt(a) - a);
};

blendingModes.darken = function (a, b) {
  return Math.min(a, b);
};

blendingModes.multiply = function (a, b) {
  return a * b;
};

blendingModes.colorburn = function (a, b) {
  return b > 0 ? 1 - Math.min((1 - a) / b, 1) : 0;
};

blendingModes.lighten = function (a, b) {
  return Math.max(a, b);
};

blendingModes.screen = function (a, b) {
  return 1 - (1 - a) * (1 - b);
};

blendingModes.hardlight = function (a, b) {
  return b <= 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
};

blendingModes.vividlight = function (a, b) {
  return b <= 0.5 ? 1 - Math.min((1 - a) / (2 * b), 1) : Math.min(a / (2 * (1 - b)), 1);
};

blendingModes.hue = function (r, g, b, blendR, blendG, blendB) {
  const baseHsl = rgbToHsl(r, g, b);
  const blendHsl = rgbToHsl(blendR, blendG, blendB);
  return hslToRgb(blendHsl.h, baseHsl.s, baseHsl.l);
};
