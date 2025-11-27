class ColorCardClass {
  constructor(id, initialContrastRatio = '1:1') {
    this.templateElement = null;
    console.log(initialContrastRatio);
    this.templateElement = new TemplateElement('colorcard-template', id, {
      contrastRatio: initialContrastRatio,
    });
  }

  reset = () => {
    this.templateElement.element.style.removeProperty('--txt');
    this.templateElement.element.style.removeProperty('--bkg');
    this.templateElement.element.style.opacity = null;
  };

  update = (color1Index, color1Hex, color2Index, color2Hex) => {
    const context = {};

    const contrastRatio = calculateContrastRatio(color1Hex, color2Hex);

    context.contrastRatio = contrastRatio + ':1';
    context.backgroundIndex = color1Index;
    context.backgroundHex = color1Hex.toUpperCase();
    context.textIndex = color2Index;
    context.textHex = color2Hex.toUpperCase();

    this.templateElement.render(context);

    this.templateElement.element.style.setProperty('--txt', color2Hex);
    this.templateElement.element.style.setProperty('--bkg', color1Hex);
    this.templateElement.element.style.opacity = 1;

    const largeAAEl = this.templateElement.element.querySelector('.colorcard-wcaglevel-large_aa');
    const largeAAAEl = this.templateElement.element.querySelector('.colorcard-wcaglevel-large_aaa');
    const regularAAEl = this.templateElement.element.querySelector(
      '.colorcard-wcaglevel-regular_aa',
    );
    const regularAAAEl = this.templateElement.element.querySelector(
      '.colorcard-wcaglevel-regular_aaa',
    );

    this.setWCAGLevel(largeAAEl, contrastRatio, 3);
    this.setWCAGLevel(largeAAAEl, contrastRatio, 4.5);
    this.setWCAGLevel(regularAAEl, contrastRatio, 4.5);
    this.setWCAGLevel(regularAAAEl, contrastRatio, 7);
  };

  setWCAGLevel = (el, currentRatio, minimumRatio) => {
    if (currentRatio >= minimumRatio) {
      el.classList.add('colorcard-wcaglevel_pass');
      el.classList.remove('colorcard-wcaglevel_fail');
    } else {
      el.classList.add('colorcard-wcaglevel_fail');
      el.classList.remove('colorcard-wcaglevel_pass');
    }
  };
}
