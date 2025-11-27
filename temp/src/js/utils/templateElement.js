class TemplateElement {
  constructor(templateId, elId, context = {}) {
    this.element = null;
    this.elementId = elId;
    this.template = null;

    const templateEl = document.getElementById(templateId);
    this.element = document.getElementById(this.elementId);
    this.template = Handlebars.compile(templateEl.innerHTML);

    this.render(context);
  }

  render(context) {
    this.context = context;
    const newElement = document.createElement('div');
    newElement.innerHTML = this.template(this.context);
    const parent = this.element.parentNode;
    const firstChildElement = newElement.firstElementChild;
    parent.replaceChild(firstChildElement, this.element);
    this.element = firstChildElement;
    this.element.id = this.elementId;
  }
}
