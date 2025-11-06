(() => {
  const MIN_SPINES = 2;
  const CAROUSEL_THRESHOLD = 5;
  const MAX_VISIBLE_COLLAPSED = 4;
  const DRAG_THRESHOLD = 6;

  class SplitShowcaseController {
    constructor(container) {
      this.container = container;
      this.section = container.closest('.shopify-section') || document;
      this.spines = Array.from(container.querySelectorAll('.group-block'));

      if (this.spines.length < MIN_SPINES) {
        return;
      }

      this.container.dataset.splitShowcaseInitialised = 'true';

      this.gap = parseFloat(getComputedStyle(container).gap) || 0;
      this.container.style.setProperty('--split-showcase-gap', `${this.gap}px`);

      this.isCarousel = this.spines.length > CAROUSEL_THRESHOLD;
      this.offset = 0;

      this.dragState = {
        active: false,
        startX: 0,
        startOffset: 0,
        moved: false,
        justDragged: false,
        pointerId: null
      };

      if (this.isCarousel) {
        this.setupCarousel();
      } else {
        this.container.classList.add('split-showcase--static');
        this.spines.forEach((spine, index) => this.decorateSpine(spine, index));
      }

      this.setActive(0, { force: true });

      if (this.isCarousel) {
        this.recalculate();
        this.resizeObserver = new ResizeObserver(() => this.recalculate());
        this.resizeObserver.observe(this.container);
      }

      if (this.section && window.Shopify && Shopify.designMode) {
        this.section.addEventListener('shopify:block:select', (event) => {
          if (!this.container.contains(event.target)) return;
          this.setActiveByBlockId(event.target.id);
        });
      }

      if (window.Shopify && Shopify.designMode) {
        requestAnimationFrame(() => this.setActive(0, { force: true }));
      }
    }

    decorateSpine(spine, index) {
      spine.classList.add('split-showcase__spine');
      spine.dataset.splitShowcaseIndex = String(index);
      spine.setAttribute('role', 'tab');
      spine.setAttribute('aria-selected', 'false');
      spine.setAttribute('tabindex', '0');

      spine.addEventListener('click', () => this.setActive(index));

      spine.addEventListener('keydown', (event) => {
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

    setupCarousel() {
      this.container.classList.add('split-showcase--carousel');

      const track = document.createElement('div');
      track.className = 'split-showcase__track';

      this.spines.forEach((spine, index) => {
        this.decorateSpine(spine, index);
        track.appendChild(spine);
      });

      this.container.appendChild(track);
      this.track = track;
      this.spines = Array.from(track.children);

      this.bindPointerEvents();
      this.handleWheel = this.onWheel.bind(this);
      this.track.addEventListener('wheel', this.handleWheel, { passive: false });
    }

    bindPointerEvents() {
      this.handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        this.dragState.active = true;
        this.dragState.pointerId = event.pointerId;
        this.dragState.startX = event.clientX;
        this.dragState.startOffset = this.offset;
        this.dragState.moved = false;
        this.dragState.justDragged = false;
        this.track.setPointerCapture(event.pointerId);
      };

      this.handlePointerMove = (event) => {
        if (!this.dragState.active || event.pointerId !== this.dragState.pointerId) return;
        const dx = event.clientX - this.dragState.startX;
        if (Math.abs(dx) > DRAG_THRESHOLD) {
          this.dragState.moved = true;
        }
        this.setOffset(this.dragState.startOffset - dx, { immediate: true });
        event.preventDefault();
      };

      this.handlePointerUp = (event) => {
        if (!this.dragState.active || event.pointerId !== this.dragState.pointerId) return;
        if (this.track.hasPointerCapture(event.pointerId)) {
          this.track.releasePointerCapture(event.pointerId);
        }
        if (this.dragState.moved) {
          event.preventDefault();
        }
        const dragged = this.dragState.moved;
        this.dragState.active = false;
        this.dragState.pointerId = null;
        this.dragState.moved = false;
        this.dragState.justDragged = dragged;
      };

      this.track.addEventListener('pointerdown', this.handlePointerDown);
      this.track.addEventListener('pointermove', this.handlePointerMove);
      this.track.addEventListener('pointerup', this.handlePointerUp);
      this.track.addEventListener('pointercancel', this.handlePointerUp);

      this.track.addEventListener('click', (event) => {
        if (this.dragState.justDragged) {
          event.preventDefault();
          event.stopPropagation();
          this.dragState.justDragged = false;
        }
      }, true);
    }

    destroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (this.track) {
        this.track.removeEventListener('pointerdown', this.handlePointerDown);
        this.track.removeEventListener('pointermove', this.handlePointerMove);
        this.track.removeEventListener('pointerup', this.handlePointerUp);
        this.track.removeEventListener('pointercancel', this.handlePointerUp);
        this.track.removeEventListener('wheel', this.handleWheel);
      }
    }

    onWheel(event) {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      this.scrollBy(delta);
    }

    setActive(index, { force = false } = {}) {
      const clamped = Math.max(0, Math.min(this.spines.length - 1, index));
      if (!force && clamped === this.activeIndex) {
        return;
      }
      this.activeIndex = clamped;

      this.spines.forEach((spine, i) => {
        const isActive = i === clamped;
        spine.classList.toggle('split-showcase__spine--active', isActive);
        spine.setAttribute('aria-selected', String(isActive));
      });

      if (this.isCarousel) {
        this.ensureInView();
      }
    }

    setActiveByBlockId(id) {
      const index = this.spines.findIndex((spine) => spine.id === id || spine.contains(document.getElementById(id)));
      if (index >= 0) {
        this.setActive(index);
      }
    }

    setOffset(desired, { immediate = false } = {}) {
      if (!this.track) return;
      const containerWidth = this.container.clientWidth || 1;
      const trackWidth = this.track.scrollWidth;
      const maxOffset = Math.max(trackWidth - containerWidth, 0);
      const clamped = Math.max(0, Math.min(desired, maxOffset));
      this.offset = clamped;

      if (immediate) {
        this.track.style.transition = 'none';
        this.track.style.transform = `translateX(-${clamped}px)`;
        this.track.offsetWidth;
        this.track.style.transition = '';
      } else {
        this.track.style.transform = `translateX(-${clamped}px)`;
      }
    }

    recalculate() {
      if (!this.isCarousel) return;
      const containerWidth = this.container.clientWidth || 1;
      const collapsedMin = 72;
      const collapsedMax = 140;
      const collapsed = Math.min(collapsedMax, Math.max(collapsedMin, containerWidth * 0.2));

      const visibleCollapsed = Math.min(Math.max(this.spines.length - 1, 0), MAX_VISIBLE_COLLAPSED);
      const availableForActive = containerWidth - visibleCollapsed * (collapsed + this.gap);
      let expanded = Math.max(containerWidth * 0.55, availableForActive);
      expanded = Math.min(expanded, containerWidth - collapsed * Math.max(visibleCollapsed - 1, 0));

      this.container.style.setProperty('--split-spine-collapsed', `${collapsed}px`);
      this.container.style.setProperty('--split-spine-expanded', `${expanded}px`);

      this.ensureInView({ immediate: true });
    }

    ensureInView({ immediate = false } = {}) {
      if (!this.isCarousel) return;
      const active = this.spines[this.activeIndex];
      if (!active) return;
      const desired = Math.max(0, active.offsetLeft - this.gap);
      this.setOffset(desired, { immediate });
    }

    scrollBy(delta) {
      this.setOffset(this.offset + delta);
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
