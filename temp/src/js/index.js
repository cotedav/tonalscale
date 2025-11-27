let baseColorPicker = new MyIroPicker('baseColorPickerInput', 'baseColorPicker');

baseColorPicker.addEventListener('color:changed', (colorHex) => {
  updateScale();
});

let blendColorPicker = new MyIroPicker('blendColorPickerInput', 'blendColorPicker');

blendColorPicker.addEventListener('color:changed', (colorHex) => {
  updateScale();
});

window.addEventListener('resize', function () {
  baseColorPicker.resizePicker();
  blendColorPicker.resizePicker();
});

let colorcardDarker45 = new ColorCardClass('colorcard-darker45', '4.5:1');
let colorcardDarker3 = new ColorCardClass('colorcard-darker3', '3:1');
let colorcardLighter3 = new ColorCardClass('colorcard-lighter3', '3:1');
let colorcardLighter45 = new ColorCardClass('colorcard-lighter45', '4.5:1');

document.getElementById('theme-toggle').addEventListener('click', function () {
  const button = this;
  const iconHolder = button.getElementsByClassName('icon-holder')[0];
  const body = document.body;
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    localStorage.removeItem('theme', 'dark');
  } else {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
});

class StateClass {
  constructor() {
    this._menuData = null;
    this._shiftkeyPressed = false;
    this._blendDistGraphData = null;
    this._scaleData = null;
  }

  getMenuData = () => this._menuData;
  setMenuData = (menuData) => (this._menuData = menuData);

  getShiftKeyPressed = () => this._shiftkeyPressed;
  setShiftKeyPressed = (shiftkeyPressed) => (this._shiftkeyPressed = shiftkeyPressed);

  getBlendDistGraphData = () => this._blendDistGraphData;
  setBlendDistGraphData = (curvePointsX, curvePointsY) =>
    (this._blendDistGraphData = {
      curvePointsX: curvePointsX,
      curvePointsY: curvePointsY,
    });

  getScaleData = () => this._scaleData;
  setScaleData = (scaleData) => (this._scaleData = scaleData);

  getDefaultParams = () => {
    return {
      colorHex: '8000ff',
      blendMode: 'colordodge',
      blendStrength: '85',
      blendR: '0',
      blendG: '0',
      blendB: '50',
      middle: '-35',
      spread: '100',
      satDarker: '30',
      satLighter: '50',
    };
  };
}

const State = new StateClass();

//////////////////////////// -------------- ////////////////////////////
//////////////////////////// EVENT HANDLING ////////////////////////////
////////////////////////////----------------////////////////////////////

function getExportParamsAsJson() {
  const currentScaleParams = getCurrentScaleParams();
  const json = JSON.stringify(currentScaleParams);
  return json;
}

document.getElementById('import-export-button').addEventListener('click', () => {
  const colorInput = document.getElementById('color-input');
  const json = getExportParamsAsJson();

  const bodyContent = `
    <textarea id="json-textarea">${json}</textarea>
  `;

  const footerContent = `
    <button id="import-button">Import</button>
    <button id="close-button" class="tonal">Close</button>
  `;

  window.dialog.open('Import/Export', bodyContent, footerContent);

  const jsonTextarea = document.getElementById('json-textarea');
  const importButton = document.getElementById('import-button');
  const closeButton = document.getElementById('close-button');

  importButton.addEventListener('click', () => {
    const importedJson = jsonTextarea.value;
    if (importedJson) {
      try {
        const params = JSON.parse(importedJson);
        applyColorScaleParams(params);
        window.dialog.close();
      } catch (error) {
        alert('Invalid JSON format');
      }
    } else {
      alert('No JSON data to import');
    }
  });

  closeButton.addEventListener('click', () => {
    window.dialog.close();
  });
});

document.getElementById('copy-button').addEventListener('click', () => {
  const colorScaleContainers = document.getElementsByClassName('color-scale-container');
  let svgNS = 'http://www.w3.org/2000/svg';
  let svg = document.createElementNS(svgNS, 'svg');
  let maxNbColorBoxes = 0;
  for (let y = 0; y < colorScaleContainers.length; y++) {
    const colorBoxes = colorScaleContainers[y].getElementsByClassName('color-box');
    for (let x = 0; x < colorBoxes.length; x++) {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', x * 40);
      rect.setAttribute('y', y * 40);
      rect.setAttribute('width', '40');
      rect.setAttribute('height', '40');
      rect.setAttribute('fill', colorBoxes[x].style.backgroundColor);
      svg.appendChild(rect);
    }
    maxNbColorBoxes = Math.max(maxNbColorBoxes, colorBoxes.length);
  }
  const url = document.createElementNS(svgNS, 'text');
  url.textContent = window.location.href;
  url.setAttribute('x', maxNbColorBoxes * 40 + 20);
  url.setAttribute('y', 0);
  url.setAttribute('font-size', '12pt');
  svg.appendChild(url);

  const exportParams = document.createElementNS(svgNS, 'text');
  exportParams.textContent = getExportParamsAsJson();
  exportParams.setAttribute('x', maxNbColorBoxes * 40 + 20);
  exportParams.setAttribute('y', 16);
  exportParams.setAttribute('font-size', '12pt');
  svg.appendChild(exportParams);
  navigator.clipboard.writeText(new XMLSerializer().serializeToString(svg));
});

let sliders = document.querySelectorAll('input[type="range"], input[type="number"]');
// Update slider values on input change
sliders.forEach(function (slider) {
  slider.addEventListener('input', function (e) {
    const el = e.target;
    const fromInput = el.type === 'number';
    if (fromInput) {
      el.value = Math.max(el.min, Math.min(el.max, el.value));
    }
    updateControlsValues(fromInput);
    updateScale();
  });
});

document.getElementById('middle-slider').addEventListener('input', (e) => {
  updateBlendDistGraph();
});

document.getElementById('spread-slider').addEventListener('input', (e) => {
  updateBlendDistGraph();
});

document.getElementById('middle-slider').addEventListener('mousedown', (e) => {
  updateBlendDistGraph();
});

function updateBlendDistGraph() {
  document.querySelectorAll('.color-scale-container').forEach((container) => {
    const blendDistGraphEl = container.querySelector('.blendDistGraph');

    if (!blendDistGraphEl) return;

    const graphData = State.getBlendDistGraphData();
    const scaleData = State.getScaleData();

    let lineColorIndex = Math.round(scaleData.luminance / 2);
    let lineColor = getOppositeColor(scaleData.colorScale[lineColorIndex].hex);

    const trace = {
      x: graphData.curvePointsX,
      y: graphData.curvePointsY,
      mode: 'lines',
      name: 'cubic bezier curve',
      line: {
        color: lineColor,
        width: 1,
        dash: 'dot',
      },
    };

    const layout = {
      showlegend: false,
      xaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        showline: false,
        showticklabels: false,
      },
      plot_bgcolor: 'rgba(0,0,0,0)', // transparent background
      paper_bgcolor: 'rgba(0,0,0,0)', // transparent background
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
        pad: 0,
      },
      autosize: true,
    };

    const config = {
      displayModeBar: false,
      staticPlot: true,
      responsive: true,
    };

    blendDistGraphEl.style.width = scaleData.luminance - 1 + '%';
    blendDistGraphEl.style.opacity = 1;

    Plotly.react(blendDistGraphEl, [trace], layout, config);
  });
}

document.getElementById('middle-slider').addEventListener('mouseup', (e) => {
  purgeBlendDistGraph();
});

document.getElementById('spread-slider').addEventListener('mouseup', (e) => {
  purgeBlendDistGraph();
});

function purgeBlendDistGraph() {
  document.querySelectorAll('.color-scale-container').forEach((container) => {
    const blendDistGraphEl = container.getElementsByClassName('blendDistGraph')[0];
    if (!blendDistGraphEl) return;
    blendDistGraphEl.innerHtml = '';
    Plotly.purge(blendDistGraphEl);
    blendDistGraphEl.style.opacity = 0;
  });
}

document.getElementById('blendmode').addEventListener('change', () => {
  updateScale();
});

// hide context menu when clicking anywhere else on the page
document.addEventListener('click', (e) => {
  document.getElementById('context-menu').style.display = 'none';
});

document.addEventListener('keydown', (e) => {
  State.setShiftKeyPressed(e.shiftKey);
});

document.addEventListener('keyup', (e) => {
  State.setShiftKeyPressed(false);
});

document.addEventListener('DOMContentLoaded', (event) => {
  const body = document.body;
  const theme = localStorage.getItem('theme');

  if (theme === 'dark') {
    body.classList.add('dark-mode');
  }

  setTimeout(function () {
    body.style.transition = '.25s';
  }, 10);

  document.querySelectorAll('.color-scale-container').forEach((container) => {
    if (container.getAttribute('showBlendDistGraph') === 'true') {
      let blendDistGraphEl = document.createElement('div');
      blendDistGraphEl.className = 'blendDistGraph';
      container.appendChild(blendDistGraphEl);
    }
  });

  window.dialog = new Dialog();
  createContextMenu();
  const scaleParams = readScaleParamsFromQueryString();
  applyColorScaleParams(scaleParams);
});

//////////////////////////// ------------------------------ ////////////////////////////
//////////////////////////// SAVE & RETRIEVE STATE FROM URL ////////////////////////////
////////////////////////////--------------------------------////////////////////////////

function updateQueryString(scaleParams) {
  // Get the current search parameters
  let currentSearchParams = new URLSearchParams(window.location.search);

  // Add new parameters
  for (let key in scaleParams) {
    currentSearchParams.set(key, scaleParams[key]);
  }

  // Replace the current query string with the new one
  history.pushState({}, null, '?' + currentSearchParams.toString());
}

function readScaleParamsFromQueryString() {
  // Get the current URL
  let url = new URL(window.location.href);

  // Parse the query string into an object
  let scaleParams = Object.fromEntries(url.searchParams.entries());

  // Define default parameters
  let defaultParams = State.getDefaultParams();

  // Define valid blendModes
  let validBlendModes = [
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
  ];

  // Check if no params are passed at all, return null
  if (Object.keys(scaleParams).length === 0) return defaultParams;

  // Validate parameters and assign default values if invalid
  scaleParams.colorHex =
    scaleParams.colorHex && isValidColor(scaleParams.colorHex)
      ? scaleParams.colorHex
      : defaultParams.colorHex;
  scaleParams.blendMode = validBlendModes.includes(scaleParams.blendMode)
    ? scaleParams.blendMode
    : defaultParams.blendMode;
  scaleParams.blendStrength = MathUtils.isInRange(scaleParams.blendStrength, 0, 100)
    ? scaleParams.blendStrength
    : defaultParams.blendStrength;
  scaleParams.blendR = MathUtils.isInRange(scaleParams.blendR, 0, 255)
    ? scaleParams.blendR
    : defaultParams.blendR;
  scaleParams.blendG = MathUtils.isInRange(scaleParams.blendG, 0, 255)
    ? scaleParams.blendG
    : defaultParams.blendG;
  scaleParams.blendB = MathUtils.isInRange(scaleParams.blendB, 0, 255)
    ? scaleParams.blendB
    : defaultParams.blendB;
  scaleParams.middle = MathUtils.isInRange(scaleParams.middle, -50, 50)
    ? scaleParams.middle
    : defaultParams.middle;
  scaleParams.spread = MathUtils.isInRange(scaleParams.spread, 0, 100)
    ? scaleParams.spread
    : defaultParams.spread;
  scaleParams.satDarker = MathUtils.isInRange(scaleParams.satDarker, 0, 100)
    ? scaleParams.satDarker
    : defaultParams.satDarker;
  scaleParams.satLighter = MathUtils.isInRange(scaleParams.satLighter, 0, 100)
    ? scaleParams.satLighter
    : defaultParams.satLighter;

  return scaleParams;
}

//////////////////////////// ---------------------------------- ////////////////////////////
//////////////////////////// UPDATE, GENERATE, DISPLAY & RENDER ////////////////////////////
////////////////////////////------------------------------------////////////////////////////

function updateControlsValues(fromInput) {
  const controls = [
    { control: 'strength-slider', input: 'strength-value' },
    { control: 'middle-slider', input: 'middle-value' },
    { control: 'spread-slider', input: 'spread-value' },
    { control: 'satDarker-slider', input: 'satDarker-value' },
    { control: 'satLighter-slider', input: 'satLighter-value' },
  ];

  controls.forEach(function (item) {
    const control = document.getElementById(item.control);
    const input = document.getElementById(item.input);
    if (fromInput) control.value = input.value;
    else input.value = control.value;
  });
}

function applyColorScaleParams(params) {
  let controlEls = getControlElements();
  baseColorPicker.updateColor(`#${params.colorHex}`);
  const blendHex = rgbToHex({
    r: params.blendR,
    g: params.blendG,
    b: params.blendB,
  });
  blendColorPicker.updateColor(blendHex);
  controlEls.blendModeSelect.value = params.blendMode;
  controlEls.strengthSlider.value = params.blendStrength;
  controlEls.middleSlider.value = params.middle;
  controlEls.spreadSlider.value = params.spread;
  controlEls.satDarkerSlider.value = params.satDarker;
  controlEls.satLighterSlider.value = params.satLighter;

  updateControlsValues(false);
  updateScale();
}

function updateScale() {
  const scaleParams = getCurrentScaleParams();
  updateQueryString(scaleParams);
  let result = generateColorScale(scaleParams);
  displayColorScale(result.colorScale, result.luminance);
}

function generateColorScale(params) {
  const rgb = hexToRgb(params.colorHex);
  let colorScale = [];

  // Convert RGB to LAB
  const lab = d3.lab(d3.rgb(rgb.r, rgb.g, rgb.b));
  const hsl = d3.hsl(d3.rgb(rgb.r, rgb.g, rgb.b));
  const luminance = Math.round(lab.l);
  const inputHue = hsl.h;

  const intensityCurve = getIntensityCurve((params.middle + 50) / 100, params.spread / 100);

  let curvePointsX2 = [];
  let curvePointsY2 = [];

  for (let i = 0; i <= 100; i++) {
    let adjustedLab = lab;

    adjustedLab.l = i;

    // Adjust chroma based on lightness
    if (i < luminance) {
      adjustedLab = d3.lab(
        adjustedLab.l,
        (i / luminance) * adjustedLab.a,
        (i / luminance) * adjustedLab.b,
      );
    } else if (i > luminance) {
      adjustedLab = d3.lab(
        adjustedLab.l,
        ((100 - i) / (100 - luminance)) * adjustedLab.a,
        ((100 - i) / (100 - luminance)) * adjustedLab.b,
      );
    }

    // Convert back to RGB
    let adjustedRgb = d3.rgb(adjustedLab);
    adjustedRgb = {
      r: Math.round(adjustedRgb.r),
      g: Math.round(adjustedRgb.g),
      b: Math.round(adjustedRgb.b),
    };

    if (i < luminance) {
      var c = intensityCurve(i / (luminance - 1));

      let intensity = getIntensity(intensityCurve, i, luminance - 1);
      curvePointsX2.push(i);
      curvePointsY2.push(intensity);

      adjustedRgb = applyBlend(
        adjustedRgb,
        params.blendMode,
        params.blendStrength / 100,
        params.blendR / 255,
        params.blendG / 255,
        params.blendB / 255,
        intensity,
      );
      adjustedRgb = applySaturation(
        adjustedRgb,
        params.satDarker / 100,
        easeInOutQuad(luminance, i),
      );
    } else if (i > luminance) {
      intensityOnScale = easeInOutQuad(100 - luminance, i - luminance);
      adjustedRgb = applySaturation(
        adjustedRgb,
        params.satLighter / 100,
        easeInOutQuad(100 - luminance, i - luminance),
      );
    }

    colorScale.push({ index: i, hex: rgbToHex(adjustedRgb) });
  }
  const scaleData = { colorScale, luminance };

  State.setBlendDistGraphData(curvePointsX2, curvePointsY2);
  State.setScaleData(scaleData);

  return scaleData;
}

function getIntensityCurve(middle, spread) {
  let p1x = 0.42;
  let p2x = 0.58;
  let factor = Math.abs(middle / 0.5 - 1);

  if (middle <= 0.5) {
    p1x += (1 - p1x) * factor;
    spread = (1 - p1x) * spread;
  } else if (middle > 0.5) {
    p2x -= p2x * factor;
    spread = p2x * spread;
  }

  p1x += spread;
  p2x -= spread;

  return cubicBezier(p1x, 0, p2x, 1);
}

function getIntensity(curve, i, luminance) {
  if (i === 0) return 0;
  if (i === luminance) return 0;

  const positionOnCurve = curve(i / luminance);

  const halfpoint = curve(0.5);
  let progress = positionOnCurve.x;

  let progressN = progress / halfpoint.y;
  progressN = progress < halfpoint.y ? progressN : 1 - (progressN - 1);

  return progressN;
}

function displayColorScale(colorScale, luminance) {
  renderScale('color-scale-container-full', colorScale, luminance);

  renderPartialScale(
    'color-scale-container-custom',
    [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100],
    colorScale,
    luminance,
  );

  renderPartialScale(
    'color-scale-container-key',
    [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100],
    colorScale,
    luminance,
  );
}

function renderPartialScale(containerElId, indexes, colorScale, luminance) {
  if (!indexes.includes(luminance)) {
    // Find the value in colorScalePaletteValues that is closest to luminance
    let closest = indexes.reduce((a, b) => {
      return Math.abs(b - luminance) < Math.abs(a - luminance) ? b : a;
    });

    // Find the index of the closest value and remove it
    let index = indexes.indexOf(closest);
    indexes.splice(index, 1);
    indexes.splice(index, 0, luminance);
  }

  let colorScalePalette = indexes.map((value) => colorScale[value]);

  renderScale(containerElId, colorScalePalette, luminance);
}

function renderScale(containerElId, colorScale, luminance) {
  const container = document.getElementById(containerElId);

  let elements = container.querySelectorAll('.color-box');
  elements.forEach((element) => {
    element.parentNode.removeChild(element);
  });

  for (let i = 0; i < colorScale.length; i++) {
    const currentColor = { indexOnScale: i, color: colorScale[i] };

    let colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = currentColor.color.hex;
    colorBox.dataset.position = i;

    let colorNumber = document.createElement('span');
    colorNumber.className = 'color-number';
    colorNumber.innerText = colorScale[i].index;

    colorBox.appendChild(colorNumber);

    if (currentColor.color.index === luminance) {
      let colorDot = document.createElement('span');
      colorDot.className = 'color-dot';
      colorBox.appendChild(colorDot);
    }

    function clearContrastHelpers() {
      let backgroundDots = container.querySelectorAll('.background-dot');
      let textDots = container.querySelectorAll('.text-dot');

      backgroundDots.forEach(function (dot) {
        dot.remove();
      });

      textDots.forEach(function (dot) {
        dot.remove();
      });
    }

    function updateContrastHelpers(offset = 0) {
      let darkerDot3 = document.createElement('span');
      darkerDot3.className = 'color-dot background-dot';

      let lighterDot3 = document.createElement('span');
      lighterDot3.className = 'color-dot text-dot';

      let darkerDot45 = document.createElement('span');
      darkerDot45.className = 'color-dot background-dot';

      let lighterDot45 = document.createElement('span');
      lighterDot45.className = 'color-dot text-dot';

      let darker45 = findClosestDarkerColor(i, offset, colorScale, 4.5);
      let darker3 = findClosestDarkerColor(i, offset, colorScale, 3);
      let lighter3 = findClosestLighterColor(i, offset, colorScale, 3);
      let lighter45 = findClosestLighterColor(i, offset, colorScale, 4.5);

      function addDot(contrastColor, currentColor, dotEl) {
        if (contrastColor) {
          const blendDistGraphIndex =
            container.getAttribute('showBlendDistGraph') === 'true' ? 1 : 0;
          container.children[blendDistGraphIndex + contrastColor.indexOnScale].appendChild(dotEl);
          //var rgb = hexToRgb(currentColor.color.hex);
          //dotEl.style.backgroundColor =
          //  "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.5)";
        }
      }

      addDot(darker45, currentColor, darkerDot45);
      addDot(darker3, currentColor, darkerDot3);
      addDot(lighter3, currentColor, lighterDot3);
      addDot(lighter45, currentColor, lighterDot45);

      let updateColorPreview = function (colorcard, bgColor, fgColor) {
        const noColor = bgColor === null || fgColor === null;
        if (noColor) {
          colorcard.reset();
        } else {
          colorcard.update(
            bgColor.color.index,
            bgColor.color.hex,
            fgColor.color.index,
            fgColor.color.hex,
          );
        }
      };

      updateColorPreview(colorcardDarker45, darker45, currentColor);
      updateColorPreview(colorcardDarker3, darker3, currentColor);
      updateColorPreview(colorcardLighter3, currentColor, lighter3);
      updateColorPreview(colorcardLighter45, currentColor, lighter45);

      State.setMenuData({
        color: colorScale[i],
        darker45: darker45?.color,
        darker3: darker3?.color,
        lighter45: lighter45?.color,
        lighter3: lighter3?.color,
      });

      let handleContextMenu = (e) => {
        showContextMenu(e, State.getMenuData());
      };

      container.removeEventListener('contextmenu', handleContextMenu);
      container.addEventListener('contextmenu', handleContextMenu);

      const stopOffset =
        (darker45 === null || darker45.indexOnScale === 0 || darker45.indexOnScale === i - 1) &&
        (darker3 === null || darker3.indexOnScale === 0 || darker3.indexOnScale === i - 1) &&
        (lighter3 === null ||
          lighter3.indexOnScale === i + 1 ||
          lighter3.indexOnScale === colorScale.length - 1) &&
        (lighter45 === null ||
          lighter45.indexOnScale === i + 1 ||
          lighter45.indexOnScale === colorScale.length - 1);
      return stopOffset;
    }

    let offset = 0;
    let stopOffset = false;

    colorBox.onwheel = function (event) {
      event.preventDefault();

      const delta = event.deltaY / Math.abs(event.deltaY);

      if (offset > 0 && stopOffset && delta < 0) return;
      if (offset < 0 && stopOffset && delta > 0) return;

      clearContrastHelpers();

      const factor = State.getShiftKeyPressed() ? 2 : 1;

      offset -= delta * factor;

      stopOffset = updateContrastHelpers(offset);
    };

    function handleMouseOver(event) {
      updateContrastHelpers();
    }
    colorBox.removeEventListener('mouseover', handleMouseOver);
    colorBox.addEventListener('mouseover', handleMouseOver);

    function handleMouseOut(e) {
      offset = 0;
      clearContrastHelpers();
    }
    colorBox.removeEventListener('mouseout', handleMouseOut);
    colorBox.addEventListener('mouseout', handleMouseOut);

    function handleClick(event) {
      if (event.button === 0) {
        copyToClipboard(colorScale[i].hex);
      }
    }
    colorBox.removeEventListener('click', handleClick);
    colorBox.addEventListener('click', handleClick);

    let colorHexEl = document.createElement('span');
    colorHexEl.className = 'color-hex';
    colorHexEl.innerText = colorScale[i].hex;
    colorBox.appendChild(colorHexEl);

    container.appendChild(colorBox);
  }
}

function findClosestDarkerColor(colorIndex, offset, scale, ratio) {
  // Find the closest darker color on the scale that meets the contrast ratio requirement
  let closestIndex;
  const color = scale[colorIndex].hex;

  for (var i = colorIndex - 1; i >= 0; i--) {
    const contrastRatio = calculateContrastRatio(color, scale[i].hex);

    if (contrastRatio >= ratio) {
      closestIndex = i;
      break;
    }
  }

  if (closestIndex !== undefined && closestIndex - offset < 0) {
    closestIndex = 0;
    offset = 0;
  } else if (closestIndex !== undefined && closestIndex - offset > colorIndex - 1) {
    closestIndex = colorIndex - 1;
    offset = 0;
  }

  return closestIndex !== undefined
    ? {
        indexOnScale: closestIndex - offset,
        color: scale[closestIndex - offset],
      }
    : null;
}

function findClosestLighterColor(colorIndex, offset, scale, ratio) {
  // Find the closest lighter color on the scale that meets the contrast ratio requirement
  let closestIndex;
  const color = scale[colorIndex].hex;

  for (var i = colorIndex + 1; i < scale.length; i++) {
    const contrastRatio = calculateContrastRatio(color, scale[i].hex);
    if (contrastRatio >= ratio) {
      closestIndex = i;
      break;
    }
  }

  if (closestIndex !== undefined && closestIndex + offset >= scale.length) {
    closestIndex = scale.length - 1;
    offset = 0;
  } else if (closestIndex !== undefined && closestIndex + offset < colorIndex + 1) {
    closestIndex = colorIndex + 1;
    offset = 0;
  }

  return closestIndex !== undefined
    ? {
        indexOnScale: closestIndex + offset,
        color: scale[closestIndex + offset],
      }
    : null;
}

function showContextMenu(e, menuData) {
  const contextMenu = document.getElementById('context-menu');

  // Remove any existing menu options
  while (contextMenu.firstChild) {
    contextMenu.firstChild.remove();
  }

  // Create menu options
  const menuOptions = [
    {
      title: 'Darker AAA (4.5:1)',
      index: menuData.darker45?.index,
      hex: menuData.darker45?.hex,
    },
    {
      title: 'Darker AA (3:1)',
      index: menuData.darker3?.index,
      hex: menuData.darker3?.hex,
    },
    {
      title: 'Color',
      index: menuData.color.index,
      hex: menuData.color.hex,
    },
    {
      title: 'Lighter AA (3:1)',
      index: menuData.lighter3?.index,
      hex: menuData.lighter3?.hex,
    },
    {
      title: 'Lighter AAA (4.5:1)',
      index: menuData.lighter45?.index,
      hex: menuData.lighter45?.hex,
    },
  ];

  menuOptions.forEach((option) => {
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');

    if (option.hex === undefined) {
      menuItem.classList.add('disabled');
    } else {
      menuItem.addEventListener('click', function () {
        copyToClipboard(option.hex);
        showCopiedMessage(option.title);
      });
    }

    const title = document.createElement('p');
    title.classList.add('title');
    title.textContent = option.title;
    menuItem.appendChild(title);

    if (option.hex !== undefined) {
      const subtitle = document.createElement('p');
      subtitle.classList.add('subtitle');
      subtitle.innerHtml = `Index: <span style='font-family: Roboto Mono'>${option.index}</span>, Hex: <span style='font-family: Roboto Mono'>${option.hex}</span>`;
      menuItem.appendChild(subtitle);
    }

    contextMenu.appendChild(menuItem);
  });

  // Display context menu at mouse position
  contextMenu.style.display = 'block';
  contextMenu.style.left = e.clientX + 'px';
  contextMenu.style.top = e.clientY + 'px';

  // Prevent the browser's default context menu from showing
  e.preventDefault();
}

//////////////////////////// ------- ////////////////////////////
//////////////////////////// HELPERS ////////////////////////////
////////////////////////////---------////////////////////////////

function getCurrentScaleParams() {
  let controlEls = getControlElements();
  let colorInputHex = baseColorPicker.getColor();
  const blendHex = blendColorPicker.getColor();
  const blendRgb = hexToRgb(blendHex);
  return {
    colorHex: colorInputHex.startsWith('#') ? colorInputHex.substring(1) : colorInputHex,
    blendMode: controlEls.blendModeSelect.value,
    blendStrength: controlEls.strengthSlider.value,
    blendR: blendRgb.r,
    blendG: blendRgb.g,
    blendB: blendRgb.b,
    middle: parseFloat(controlEls.middleSlider.value),
    spread: parseFloat(controlEls.spreadSlider.value),
    satDarker: parseInt(controlEls.satDarkerSlider.value),
    satLighter: parseInt(controlEls.satLighterSlider.value),
  };
}

function getControlElements() {
  return {
    colorInput: document.getElementById('color-input'),
    blendModeSelect: document.getElementById('blendmode'),
    strengthSlider: document.getElementById('strength-slider'),
    middleSlider: document.getElementById('middle-slider'),
    spreadSlider: document.getElementById('spread-slider'),
    satDarkerSlider: document.getElementById('satDarker-slider'),
    satLighterSlider: document.getElementById('satLighter-slider'),
  };
}

//////////////////////////// --------- ////////////////////////////
//////////////////////////// CLIPBOARD ////////////////////////////
////////////////////////////-----------////////////////////////////

function showCopiedMessage(message) {
  let messageElement = document.getElementById('copied-message');
  messageElement.textContent = message + ' copied!';
  messageElement.classList.add('show');

  setTimeout(function () {
    messageElement.classList.remove('show');
  }, 2000);
}

function createContextMenu() {
  // create context menu div
  const contextMenu = document.createElement('div');
  contextMenu.id = 'context-menu';
  document.body.appendChild(contextMenu);
}
