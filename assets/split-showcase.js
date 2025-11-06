(() => {
  class SplitShowcaseController {
    constructor(container) {
      this.container = container;
      this.section = container.closest('.shopify-section') || document;
      this.spines = Array.from(container.querySelectorAll('.group-block'));
      if (this.spines.length < 2) {
        return;
      }

      this.container.dataset.splitShowcaseInitialised = 'true';

      const computedGap = parseFloat(getComputedStyle(container).gap) || 0;
      this.container.style.setProperty('--split-showcase-gap', `${computedGap}px`);

      this.isCarousel = this.spines.length > 5;
      this.offset = 0;

      if (this.isCarousel) {
        this.initialiseCarousel();
      } else {
        this.container.classList.add('split-showcase--static');
        this.spines.forEach((group, index) => {
          this.decorateSpine(group, index);
        });
      }

      this.setActive(0, { force: true });

      if (this.isCarousel) {
        this.recalculate();
        this.resizeObserver = new ResizeObserver(() => this.recalculate());
        this.resizeObserver.observe(this.container);
      }

      if (this.section && window.Shopify && Shopify.designMode) {
        this.section.addEventListener('shopify:block:select', (event) => {
          if (this.container.contains(event.target)) {
            this.setActiveByBlockId(event.target.id);
          }
        });
      }
    }

    decorateSpine(group, index) {
      group.classList.add('split-showcase__spine');
      group.dataset.splitShowcaseIndex = String(index);
      group.setAttribute('role', 'tab');
      group.setAttribute('aria-selected', 'false');
      group.setAttribute('tabindex', '0');

      group.addEventListener('click', () => {
        this.setActive(index);
      });

      group.addEventListener('keydown', (event) => {
        const { key } = event;
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          this.setActive(index);
        } else if (key === 'ArrowRight') {
          event.preventDefault();
          const next = Math.min(this.spines.length - 1, index + 1);
          this.setActive(next);
          this.spines[next].focus();
        } else if (key === 'ArrowLeft') {
          event.preventDefault();
          const prev = Math.max(0, index - 1);
          this.setActive(prev);
          this.spines[prev].focus();
        }
      });
    }

    initialiseCarousel() {
      this.container.classList.add('split-showcase--carousel');

      const track = document.createElement('div');
      track.className = 'split-showcase__track';

      this.spines.forEach((group, index) => {
        this.decorateSpine(group, index);
      track.appendChild(group);
    });

    this.container.appendChild(track);
    this.track = track;
    this.spines = Array.from(track.children);

    this.onWheel = (event) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta !== 0) {
        event.preventDefault();
          this.scrollBy(delta);
        }
      };

      track.addEventListener('wheel', this.onWheel, { passive: false });
    }

    destroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (this.track && this.onWheel) {
        this.track.removeEventListener('wheel', this.onWheel);
      }
    }

    setActive(index, { force = false } = {}) {
      const clamped = Math.max(0, Math.min(this.spines.length - 1, index));
      if (!force && clamped === this.activeIndex) {
        return;
      }
      this.activeIndex = clamped;

      this.spines.forEach((group, i) => {
        const isActive = i === clamped;
        group.classList.toggle('split-showcase__spine--active', isActive);
        group.setAttribute('aria-selected', String(isActive));
      });

      if (this.isCarousel) {
        this.updateOffset();
      }
    }

    setActiveByBlockId(id) {
      const index = this.spines.findIndex((group) => group.id === id || group.contains(document.getElementById(id)));
      if (index >= 0) {
        this.setActive(index);
      }
    }

    recalculate() {
      if (!this.isCarousel) return;
      const containerWidth = this.container.clientWidth || 1;
      const count = this.spines.length;
      const gap = parseFloat(getComputedStyle(this.container).getPropertyValue('--split-showcase-gap')) || 0;

      const minCollapsed = 72;
      const maxCollapsed = 140;
      const collapsed = Math.min(maxCollapsed, Math.max(minCollapsed, containerWidth * 0.20));

      const visibleCollapsed = Math.min(Math.max(count - 1, 0), 4);
      const availableForActive = containerWidth - visibleCollapsed * (collapsed + gap);
      let expanded = Math.max(containerWidth * 0.5, availableForActive);
      expanded = Math.min(expanded, containerWidth - collapsed * Math.max(visibleCollapsed - 1, 0));

      this.container.style.setProperty('--split-spine-collapsed', `${collapsed}px`);
      this.container.style.setProperty('--split-spine-expanded', `${expanded}px`);

      this.updateOffset(true);
    }

    updateOffset(immediate = false) {
      if (!this.track) return;
      const containerWidth = this.container.clientWidth;
      const trackWidth = this.track.scrollWidth;
      const active = this.spines[this.activeIndex];
      if (!active) return;

      const extra = Math.max(trackWidth - containerWidth, 0);
      if (extra <= 0) {
        this.offset = 0;
        this.track.style.transform = 'translateX(0)';
        return;
      }

      const activeLeft = active.offsetLeft;
      const activeWidth = active.offsetWidth;
      let desired = activeLeft + activeWidth / 2 - containerWidth / 2;
      desired = Math.max(0, Math.min(desired, extra));

      this.offset = desired;
      if (immediate) {
        this.track.style.transition = 'none';
        void this.track.offsetWidth;
        this.track.style.transform = `translateX(-${desired}px)`;
        void this.track.offsetWidth;
        this.track.style.transition = '';
      } else {
        this.track.style.transform = `translateX(-${desired}px)`;
      }
    }

    scrollBy(delta) {
      if (!this.track) return;
      const containerWidth = this.container.clientWidth;
      const trackWidth = this.track.scrollWidth;
      const extra = Math.max(trackWidth - containerWidth, 0);
      if (extra <= 0) return;

      const step = delta;
      let desired = this.offset + step;
      desired = Math.max(0, Math.min(desired, extra));
      this.offset = desired;
      this.track.style.transform = `translateX(-${desired}px)`;
    }
  }

  function initialise(container) {
    if (!container || container.dataset.splitShowcaseInitialised === 'true') return;
    const controller = new SplitShowcaseController(container);
    container.splitShowcaseController = controller;
  }

  function initAll() {
    document.querySelectorAll('[data-split-showcase="true"]').forEach(initialise);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', (event) => {
    const container = event.target.querySelector('[data-split-showcase="true"]');
    if (container) initialise(container);
  });
})();
