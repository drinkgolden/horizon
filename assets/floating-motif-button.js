const DISMISS_KEY = 'floatingMotifButtonDismissed';

class FloatingMotifButton {
  constructor(element) {
    this.element = element;
    this.closeButton = element.querySelector('[data-floating-motif-close]');
    this.visibilityThreshold = 0;
    this.dismissed = this.readDismissState();

    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.updateThreshold();
    this.init();
  }

  init() {
    if (this.dismissed) {
      this.element.classList.add('is-dismissed');
      this.element.setAttribute('aria-hidden', 'true');
      return;
    }

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.handleClose);
    }

    requestAnimationFrame(() => {
      this.syncVisibility();
    });
  }

  updateThreshold() {
    this.visibilityThreshold = window.innerHeight || document.documentElement.clientHeight || 0;
  }

  handleScroll() {
    this.syncVisibility();
  }

  handleResize() {
    this.updateThreshold();
    this.syncVisibility();
  }

  syncVisibility() {
    if (this.dismissed) {
      return;
    }

    const scrollPosition = window.scrollY || window.pageYOffset || 0;
    const shouldShow = scrollPosition > this.visibilityThreshold;

    this.element.classList.toggle('is-visible', shouldShow);
    this.element.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  }

  handleClose(event) {
    event.preventDefault();
    this.dismiss();
  }

  dismiss() {
    this.dismissed = true;
    this.element.classList.remove('is-visible');
    this.element.classList.add('is-dismissed');
    this.element.setAttribute('aria-hidden', 'true');
    this.storeDismissState();
    this.teardown();
  }

  teardown() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.handleClose);
    }
  }

  storeDismissState() {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (error) {
      // Access to sessionStorage can fail in some privacy contexts; ignore.
    }
  }

  readDismissState() {
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch (error) {
      return false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelector('[data-floating-motif-button]');
  if (!element) {
    return;
  }

  new FloatingMotifButton(element);
});
