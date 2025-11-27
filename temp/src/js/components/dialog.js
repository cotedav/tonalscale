//////////////////////////// ------ ////////////////////////////
//////////////////////////// DIALOG ////////////////////////////
////////////////////////////--------////////////////////////////

class Dialog {
  constructor() {
    this.overlay = document.getElementById('dialog-overlay');
    this.dialog = document.getElementById('dialog');
    this.title = document.getElementById('dialog-title');
    this.body = document.getElementById('dialog-body');
    this.footer = document.getElementById('dialog-footer');
    this.closeButton = document.getElementById('dialog-close');

    this.closeButton.addEventListener('click', () => this.close());

    // Prevent clicks on the overlay from closing the dialog
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        event.stopPropagation();
      }
    });
  }

  open(titleText, bodyContent, footerContent) {
    this.title.textContent = titleText;
    this.body.innerHTML = bodyContent;
    this.footer.innerHTML = footerContent;
    this.overlay.style.display = 'block';
    this.dialog.style.display = 'block';
  }

  close() {
    this.overlay.style.display = 'none';
    this.dialog.style.display = 'none';
  }
}
