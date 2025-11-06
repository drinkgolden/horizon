(() => {
  const CONTROLLER_KEY = '__splitShowcaseController';

  class SplitShowcaseController {
    constructor(track) {
      this.track = track;
      this.section = track.closest('.shopify-section') || track.parentElement;
      this.groups = Array.from(track.querySelectorAll('.group-block'));

      this.track.dataset.splitShowcaseInitialised = 'true';

      this.activeIndex = 0;
      this.gap = 0;

      if (this.groups.length <= 5) {
        return;
      }

      this.track.classList.add('split-showcase--carousel');
      this.track.setAttribute('role', 'tablist');

      this.groups.forEach((group, index) => {
        group.classList.add('split-showcase__spine');
        group.dataset.splitShowcaseIndex = String(index);
        group.setAttribute('tabindex', '0');
        group.setAttribute('role', 'tab');
        group.setAttribute('aria-selected', 'false');

        group.addEventListener('click', () => {
          this.setActive(index);
        });

        group.addEventListener('keydown', (event) => {
          this.handleKeydown(event, index);
        });
      });

      this.setActive(0, { force: true });
      this.recalculate();

      this.resizeObserver = new ResizeObserver(() => this.recalculate());
      this.resizeObserver.observe(this.track);

      if (!window.SplitShowcaseControllers) {
        window.SplitShowcaseControllers = new Map();
      }
      window.SplitShowcaseControllers.set(this.track.id || this.section.id || crypto.randomUUID(), this);
    }

    destroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }

    handleKeydown(event, index) {
      const { key } = event;
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.setActive(index);
      } else if (key === 'ArrowRight') {
        event.preventDefault();
        this.setActive(Math.min(this.groups.length - 1, index + 1));
        this.groups[this.activeIndex].focus();
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        this.setActive(Math.max(0, index - 1));
        this.groups[this.activeIndex].focus();
      }
    }

    setActive(index, { force = false } = {}) {
      const clamped = Math.max(0, Math.min(this.groups.length - 1, index));
      if (!force && clamped === this.activeIndex) return;

      this.activeIndex = clamped;

      this.groups.forEach((group, i) => {
        const isActive = i === clamped;
        group.classList.toggle('split-showcase__spine--active', isActive);
        group.setAttribute('aria-selected', String(isActive));
      });

      this.ensureInView();
    }

    setActiveByBlockId(id) {
      const index = this.groups.findIndex((group) => group.id === id || group.contains(document.getElementById(id)));
      if (index >= 0) {
        this.setActive(index);
      }
    }

    recalculate() {
      const styles = getComputedStyle(this.track);
      this.gap = parseFloat(styles.gap) || 0;
      const width = this.track.clientWidth || 1;

      const count = this.groups.length;
      const collapsedVisible = Math.min(Math.max(count - 1, 0), 4);

      const minCollapsed = 72;
      const maxCollapsed = 120;
      let collapsed = Math.min(maxCollapsed, Math.max(minCollapsed, width * 0.18));

      const availableForActive = width - (collapsed + this.gap) * collapsedVisible;
      let expanded = Math.max(width * 0.45, availableForActive);
      expanded = Math.min(expanded, width - collapsed * Math.max(collapsedVisible - 1, 0));

      if (!Number.isFinite(collapsed) || collapsed <= 0) {
        collapsed = minCollapsed;
      }
      if (!Number.isFinite(expanded) || expanded <= collapsed) {
        expanded = width - collapsedVisible * collapsed - this.gap * collapsedVisible;
      }

      this.track.style.setProperty('--split-spine-collapsed', `${collapsed}px`);
      this.track.style.setProperty('--split-spine-expanded', `${expanded}px`);

      this.ensureInView({ immediate: true });
    }

    ensureInView({ immediate = false } = {}) {
      const active = this.groups[this.activeIndex];
      if (!active) return;

      const behavior = immediate ? 'auto' : 'smooth';
      if (typeof active.scrollIntoView === 'function') {
        active.scrollIntoView({
          behavior,
          inline: 'center',
          block: 'nearest'
        });
      } else {
        const trackRect = this.track.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const deltaLeft = activeRect.left - trackRect.left;
        const deltaRight = activeRect.right - trackRect.right;
        if (deltaLeft < 0) {
          this.track.scrollBy({ left: deltaLeft, behavior });
        } else if (deltaRight > 0) {
          this.track.scrollBy({ left: deltaRight, behavior });
        }
      }
    }
  }

  function initialiseTrack(track) {
    if (!track || track.dataset.splitShowcaseInitialised === 'true') return;
    const section = track.closest('.shopify-section');
    if (track[CONTROLLER_KEY]) {
      track[CONTROLLER_KEY].destroy();
    }
    const controller = new SplitShowcaseController(track);
    track[CONTROLLER_KEY] = controller;

    if (section && window.Shopify && Shopify.designMode) {
      section.addEventListener('shopify:block:select', (event) => {
        if (track.contains(event.target)) {
          controller.setActiveByBlockId(event.target.id);
        }
      });
    }
  }

  function initAll() {
    document.querySelectorAll('[data-split-showcase="true"]').forEach(initialiseTrack);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', (event) => {
    const track = event.target.querySelector('[data-split-showcase="true"]');
    if (track) {
      initialiseTrack(track);
    }
  });
})();
