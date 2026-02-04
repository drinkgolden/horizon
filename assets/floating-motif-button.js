const DISMISS_KEY = 'floatingMotifButtonDismissed';

class FloatingMotifButton {
  constructor(element) {
    this.element = element;
    this.closeButton = element.querySelector('[data-floating-motif-close]');
    this.visibilityThreshold = 0;
    this.scrollRevealPercent = this.readScrollRevealPercent();
    this.dismissed = this.readDismissState();
    this.defaultMotifColors = this.readDefaultMotifColors();
    this.colorSyncQueued = false;

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
      this.syncColorScheme();
    });
  }

  updateThreshold() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    if (this.scrollRevealPercent > 0) {
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight || 0,
        document.body?.scrollHeight || 0
      );
      const maxScroll = Math.max(scrollHeight - viewportHeight, 0);
      this.visibilityThreshold = (maxScroll * this.scrollRevealPercent) / 100;
      return;
    }

    this.visibilityThreshold = viewportHeight;
  }

  handleScroll() {
    this.syncVisibility();
    this.queueColorSync();
  }

  handleResize() {
    this.updateThreshold();
    this.syncVisibility();
    this.queueColorSync();
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

  queueColorSync() {
    if (this.colorSyncQueued) {
      return;
    }
    this.colorSyncQueued = true;
    requestAnimationFrame(() => {
      this.colorSyncQueued = false;
      this.syncColorScheme();
    });
  }

  syncColorScheme() {
    if (!this.element || this.dismissed) {
      return;
    }

    const motifRect = this.element.getBoundingClientRect();
    if (motifRect.height === 0) {
      return;
    }

    let probeY = motifRect.top - 2;
    if (probeY < 0) {
      probeY = Math.max(window.innerHeight - 2, 0);
    }
    const probeX = Math.min(Math.max(window.innerWidth / 2, 0), window.innerWidth - 1);
    let target = document.elementFromPoint(probeX, probeY);

    if (target && this.element.contains(target)) {
      probeY = Math.max(motifRect.top - 8, 0);
      target = document.elementFromPoint(probeX, probeY);
    }

    const schemeElement = this.findColorSchemeElement(target);
    if (!schemeElement) {
      this.resetMotifColors();
      return;
    }

    const styles = window.getComputedStyle(schemeElement);
    const background = styles.getPropertyValue('--color-background').trim();
    const foreground = styles.getPropertyValue('--color-foreground').trim();

    if (background) {
      this.element.style.setProperty('--motif-button-background', background);
    } else {
      this.resetMotifColors('background');
    }

    if (foreground) {
      this.element.style.setProperty('--motif-button-text-color', foreground);
    } else {
      this.resetMotifColors('foreground');
    }
  }

  findColorSchemeElement(node) {
    if (!node) {
      return null;
    }

    let current = node;
    while (current && current !== document.body) {
      if (current.classList) {
        for (const className of current.classList) {
          if (className.startsWith('color-')) {
            return current;
          }
        }
      }
      current = current.parentElement;
    }

    return document.body;
  }

  readDefaultMotifColors() {
    if (!this.element) {
      return {
        background: '',
        foreground: ''
      };
    }

    const styles = window.getComputedStyle(this.element);
    return {
      background: styles.getPropertyValue('--motif-button-background').trim(),
      foreground: styles.getPropertyValue('--motif-button-text-color').trim()
    };
  }

  resetMotifColors(channel) {
    if (!this.defaultMotifColors) {
      return;
    }

    if (!channel || channel === 'background') {
      if (this.defaultMotifColors.background) {
        this.element.style.setProperty('--motif-button-background', this.defaultMotifColors.background);
      }
    }

    if (!channel || channel === 'foreground') {
      if (this.defaultMotifColors.foreground) {
        this.element.style.setProperty('--motif-button-text-color', this.defaultMotifColors.foreground);
      }
    }
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

  readScrollRevealPercent() {
    const rawValue = this.element?.dataset?.scrollRevealPercent;
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return 0;
    }

    const parsed = Number.parseFloat(rawValue);
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      return 0;
    }

    return Math.min(Math.max(parsed, 0), 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelector('[data-floating-motif-button]');
  if (!element) {
    return;
  }

  new FloatingMotifButton(element);
});
