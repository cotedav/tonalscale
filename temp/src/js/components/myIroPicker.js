class MyIroPicker extends EventTarget {
  #pickerEl;
  #inputEl;
  #colorInputEl;
  #colorColorEl;
  #slidersEl;

  #pickerBox;
  #pickerHsl;
  #pickerRgb;

  constructor(inputId, pickerId) {
    super();

    this.#inputEl = new TemplateElement('my-iro-picker-input-template', inputId).element;

    this.#colorInputEl = this.#inputEl.querySelector('.my-iropicker-input');
    this.#colorInputEl.value = '#ffffff';

    this.#colorColorEl = this.#inputEl.querySelector('.my-iropicker-color');

    this.#pickerEl = new TemplateElement('my-iro-picker-template', pickerId).element;

    this.#colorInputEl.addEventListener('input', this.updateColorPickerFromInput);

    this.#colorColorEl.addEventListener('click', this.togglePicker);

    this.#slidersEl = this.#pickerEl.querySelector('.my-iropicker-sliders');

    const pickerBoxEl = this.#pickerEl.querySelector('.my-iropicker-box');
    this.#pickerBox = new iro.ColorPicker(pickerBoxEl, {
      width: 108,
      color: 'rgb(255, 0, 0)',
      borderWidth: 2,
      borderColor: '#333',
      layout: [
        {
          component: iro.ui.Box,
          options: {},
        },
      ],
    });

    const pickerHslEl = this.#pickerEl.querySelector('.my-iropicker-slider-hsl');
    this.#pickerHsl = new iro.ColorPicker(pickerHslEl, {
      width: 250,
      color: 'rgb(255, 0, 0)',
      borderWidth: 2,
      borderColor: '#fff',
      layout: [
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'hue',
            showInput: true,
            showLabel: true,
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'saturation',
            showInput: true,
            showLabel: true,
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'value',
            showInput: true,
            showLabel: true,
          },
        },
      ],
    });

    const pickerRgbEl = this.#pickerEl.querySelector('.my-iropicker-slider-rgb');
    this.#pickerRgb = new iro.ColorPicker(pickerRgbEl, {
      width: 250,
      color: 'rgb(255, 0, 0)',
      borderWidth: 2,
      borderColor: '#fff',
      layout: [
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'red',
            showInput: true,
            showLabel: true,
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'green',
            showInput: true,
            showLabel: true,
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'blue',
            showInput: true,
            showLabel: true,
          },
        },
      ],
    });

    this.#pickerBox.on('input:change', this.updatePicker);
    this.#pickerHsl.on('input:change', this.updatePicker);
    this.#pickerRgb.on('input:change', this.updatePicker);
    this.#pickerRgb.on('mount', this.resizePicker);

    this.#pickerEl
      .querySelector('.my-iropicker-toggle-button-hsv')
      .addEventListener('click', () => {
        this.#pickerEl.classList.remove('my-iropicker-rgb');
        this.resizePicker();
      });

    this.#pickerEl
      .querySelector('.my-iropicker-toggle-button-rgb')
      .addEventListener('click', () => {
        this.#pickerEl.classList.add('my-iropicker-rgb');
        this.resizePicker();
      });
  }

  updateColorPickerFromInput = () => {
    let colorHex = this.#colorInputEl.value;
    if (isValidColor(colorHex)) {
      this.updatePicker(new iro.Color(colorHex));
      this.#colorColorEl.style.backgroundColor = colorHex;
      this.#dispatchColorChangedEvent(colorHex);
    }
  };

  updatePicker = (color) => {
    this.#pickerBox.color.set(color.hexString);
    this.#pickerHsl.color.set(color.hexString);
    this.#pickerRgb.color.set(color.hexString);
    this.#colorInputEl.value = color.hexString;
    this.#colorColorEl.style.backgroundColor = color.hexString;
    this.#dispatchColorChangedEvent(color);
  };

  togglePicker = () => {
    if (this.#pickerEl.style.height) {
      this.#pickerEl.style.height = null;
    } else {
      this.#pickerEl.style.height = this.#pickerEl.scrollHeight + 'px';
      setTimeout(() => {
        this.resizePicker();
      }, 150);
    }
  };

  resizePicker = () => {
    this.#pickerHsl.resize(50);
    this.#pickerRgb.resize(50);
    requestAnimationFrame(() => {
      this.#pickerHsl.resize(this.#slidersEl.scrollWidth);
      this.#pickerRgb.resize(this.#slidersEl.scrollWidth);
    });
  };

  updateColor = (hex) => {
    this.#colorInputEl.value = hex;
    this.updateColorPickerFromInput();
  };

  getColor = () => {
    return this.#colorInputEl.value;
  };

  #dispatchColorChangedEvent = (colorHex) => {
    this.dispatchEvent(new CustomEvent('color:changed', { colorHex: colorHex }));
  };
}
