//////////////////////////// ----- ////////////////////////////
//////////////////////////// COLOR ////////////////////////////
////////////////////////////-------////////////////////////////

function rgbToHsl(r, g, b) {
  ((r /= 255), (g /= 255), (b /= 255));
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    ((h = h / 6), 2);
  }

  return { h: h, s: s, l: l };
}

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function getLuminance(rgb) {
  var r = rgb.r / 255;
  var g = rgb.g / 255;
  var b = rgb.b / 255;

  var gammaCorrect = function (value) {
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  var linearR = gammaCorrect(r);
  var linearG = gammaCorrect(g);
  var linearB = gammaCorrect(b);

  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

function rgbToHex(rgb) {
  if (typeof rgb === 'string') {
    // Extract the RGB values from a string
    const color = d3.color(rgb);
    return color ? color.hex() : '';
  } else if (typeof rgb === 'object') {
    // Assume the object has r, g, and b properties
    const color = d3.rgb(rgb.r, rgb.g, rgb.b);
    return color.hex();
  }
  return '';
}

function hexToRgb(hex) {
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  const color = d3.color(hex);
  return color
    ? {
        r: color.r,
        g: color.g,
        b: color.b,
      }
    : null;
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let d = max - min;
  let h;
  let s = max === 0 ? 0 : d / max;
  let v = max;

  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = g - b + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = b - r + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = r - g + d * 4;
      h /= 6 * d;
      break;
  }

  return { h: h, s: s, v: v };
}

function hsvToRgb(h, s, v) {
  let r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      ((r = v), (g = t), (b = p));
      break;
    case 1:
      ((r = q), (g = v), (b = p));
      break;
    case 2:
      ((r = p), (g = v), (b = t));
      break;
    case 3:
      ((r = p), (g = q), (b = v));
      break;
    case 4:
      ((r = t), (g = p), (b = v));
      break;
    case 5:
      ((r = v), (g = p), (b = q));
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function applyBlend(rgb, blendMode, blendStrength, red, green, blue, intensity) {
  if ((red === 0 && blue === 0 && green === 0) || intensity === 0) return rgb;

  if (red < 0 || red > 1 || blue < 0 || blue > 1 || green < 0 || green > 1) {
    console.error('Invalid color values provided. Ensure all values are in the range 0-1.');
    return rgb;
  }

  if (intensity < 0 || intensity > 1) {
    console.error('Invalid intensity value provided. Ensure it is in the range 0-1.');
    return rgb;
  }

  let blendedRgb = null;

  if (blendMode === 'hue') {
    blendedRgb = blendingModes['hue'](rgb.r, rgb.g, rgb.b, red, green, blue);
    blendedRgb.r = rgb.r + intensity * blendStrength * (blendedRgb.r - rgb.r);
    blendedRgb.g = rgb.g + intensity * blendStrength * (blendedRgb.g - rgb.g);
    blendedRgb.b = rgb.b + intensity * blendStrength * (blendedRgb.b - rgb.b);
  } else {
    let blendedRed = blendingModes[blendMode](rgb.r / 255, red);
    let blendedGreen = blendingModes[blendMode](rgb.g / 255, green);
    let blendedBlue = blendingModes[blendMode](rgb.b / 255, blue);
    blendedRgb = d3.rgb(blendedRed, blendedGreen, blendedBlue);

    // Mix the blended color with the original color based on intensity
    blendedRgb.r =
      (rgb.r / 255) * (1 - intensity * blendStrength) + blendedRgb.r * intensity * blendStrength;
    blendedRgb.g =
      (rgb.g / 255) * (1 - intensity * blendStrength) + blendedRgb.g * intensity * blendStrength;
    blendedRgb.b =
      (rgb.b / 255) * (1 - intensity * blendStrength) + blendedRgb.b * intensity * blendStrength;

    // Convert the color back to RGB
    blendedRgb = d3.rgb(blendedRgb.r * 255, blendedRgb.g * 255, blendedRgb.b * 255);
  }

  return blendedRgb;
}

function applySaturation(rgb, saturation, intensity) {
  if (saturation < 0 || saturation > 1 || intensity < 0 || intensity > 1) {
    console.error(
      'Invalid saturation or intensity value provided. Ensure both are in the range 0-1.',
    );
    debugger;
    return rgb;
  }

  // Convert RGB color to HSV
  let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  // Calculate new saturation based on current saturation, desired increase, and intensity
  let newSaturation = hsv.s + (1 - hsv.s) * saturation * intensity;

  // Update the saturation in HSV color
  hsv.s = newSaturation;

  // Convert HSV back to RGB
  let saturatedRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  return saturatedRgb;
}

function isValidColor(color) {
  // Use regular expression to check the validity of the color value
  const colorRegex = /^#[0-9a-fA-F]{6}$/;
  return colorRegex.test(color);
}

function calculateContrastRatio(color1, color2) {
  // Convert hex colors to RGB
  var rgb1 = hexToRgb(color1);
  var rgb2 = hexToRgb(color2);

  // Calculate the contrast ratio between two colors
  var luminance1 = getLuminance(rgb1);
  var luminance2 = getLuminance(rgb2);

  var ratio = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

  ratio = MathUtils.roundDecimalPlaces(ratio, 1);

  return ratio;
}

function convertShorthandToFullHexColor(color) {
  color = color.replace('#', '');

  if (color.length === 3) {
    let r = color.charAt(0);
    let g = color.charAt(1);
    let b = color.charAt(2);

    color = r + r + g + g + b + b;
  }

  return '#' + color;
}

function getOppositeColor(hexColor) {
  let color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;

  let r = 255 - parseInt(color.substring(0, 2), 16);
  let g = 255 - parseInt(color.substring(2, 4), 16);
  let b = 255 - parseInt(color.substring(4, 6), 16);

  // Ensure each color component is two digits
  r = ('0' + r.toString(16)).slice(-2);
  g = ('0' + g.toString(16)).slice(-2);
  b = ('0' + b.toString(16)).slice(-2);

  // Combine the components back into a single hex color string
  return '#' + r + g + b;
}
