import { onDocumentLoaded } from '@theme/utilities';

class DualAccordionRow {
  static loadedModules = new Set();

  /**
   * @param {HTMLDetailsElement} details
   */
  constructor(details) {
    this.details = details;
    this.row = details.closest('[data-dual-row]');
    this.summary = details.querySelector('.dual-accordion-summary');
    this.panesWrapper = details.querySelector('.dual-row__panes');
    this.panes = Array.from(details.querySelectorAll('.dual-row__pane'));
    this.detailsContent = details.querySelector('.dual-accordion-content');
    this.lazyInitialized = new WeakSet();

    /** @type {AbortController} */
    this.controller = new AbortController();
    /** @type {'left' | 'right'} */
    this.defaultSide = (details.dataset.defaultSide ?? 'left');
    /** @type {'left' | 'right'} */
    this.activeSide = this.defaultSide;
    /** @type {'left' | 'right' | null} */
    this.hoveredSide = null;
    /** @type {boolean} */
    this.isRowHovered = false;

    this.#updateEmptyState();
    this.#syncActiveReveal();
    this.#applyColorState(this.details.open);
    this.#bindEvents();
  }

  destroy() {
    this.controller.abort();
  }

  #bindEvents() {
    const { signal } = this.controller;

    this.summary?.addEventListener('click', this.#handleSummaryClick, { signal });
    this.summary?.addEventListener('pointermove', this.#handlePointerMove, { signal, passive: true });
    this.summary?.addEventListener('pointerdown', this.#handlePointerMove, { signal, passive: true });
    this.summary?.addEventListener('pointerleave', this.#clearHoverState, { signal });

    this.details.addEventListener('toggle', this.#handleToggle, { signal });
    this.row?.addEventListener('mouseenter', this.#handleRowEnter, { signal });
    this.row?.addEventListener('mouseleave', this.#handleRowLeave, { signal });
    window.addEventListener('resize', this.#handleResize, { signal });
  }

  #handleSummaryClick = (event) => {
    const side = this.#resolveSideFromEvent(event) ?? this.hoveredSide ?? this.defaultSide;
    this.#setActiveSide(side);
  };

  /**
   * @param {PointerEvent} event
   */
  #handlePointerMove = (event) => {
    if (!this.summary) return;

    const side = this.#resolveSideFromEvent(event);
    if (!side) return;

    this.hoveredSide = side;
    this.#toggleHeadingHover(side);
  };

  #clearHoverState = () => {
    this.hoveredSide = null;
    this.summary?.querySelectorAll('.dual-accordion-summary__heading').forEach((heading) => {
      heading.classList.remove('is-hovered');
    });
  };

  #handleToggle = () => {
    this.#applyColorState(this.details.open || this.isRowHovered);
    if (this.details.open) {
      this.#setActiveSide(this.activeSide);
      this.#updateWrapperHeight();
    }
  };

  #handleRowEnter = () => {
    this.isRowHovered = true;
    this.#applyColorState(true);
  };

  #handleRowLeave = () => {
    this.isRowHovered = false;
    if (!this.details.open) {
      this.#applyColorState(false);
    }
  };

  #handleResize = () => {
    if (!this.details.open) return;
    this.#updateWrapperHeight();
  };

  /**
   * @param {Event | PointerEvent} event
   * @returns {'left' | 'right' | null}
   */
  #resolveSideFromEvent(event) {
    const target = /** @type {HTMLElement | null} */ (event.target instanceof HTMLElement ? event.target : null);
    const heading = target?.closest('[data-side]');
    if (heading && heading instanceof HTMLElement) {
      return /** @type {'left' | 'right'} */ (heading.dataset.side ?? null);
    }

    if (!this.summary) return null;
    if (this.panes.length <= 1) return this.panes[0]?.dataset.slot === 'right' ? 'right' : 'left';

    const rect = this.summary.getBoundingClientRect();
    const pointX = event instanceof PointerEvent ? event.clientX : rect.left;
    const midpoint = rect.left + rect.width / 2;

    return pointX > midpoint ? 'right' : 'left';
  }

  /**
   * @param {'left' | 'right'} side
   */
  #toggleHeadingHover(side) {
    if (!this.summary) return;

    this.summary.querySelectorAll('.dual-accordion-summary__heading').forEach((heading) => {
      heading.classList.toggle('is-hovered', heading.getAttribute('data-side') === side);
    });
  }

  /**
   * @param {'left' | 'right'} side
   */
  #setActiveSide(side) {
    const availableSlot = this.panes.some((pane) => pane.dataset.slot === side);
    if (!availableSlot) return;

    this.activeSide = side;
    this.#syncActiveReveal();
  }

  #syncActiveReveal() {
    if (this.panes.length === 0) return;

    let desiredSide = this.activeSide;
    if (!this.panes.some((pane) => pane.dataset.slot === desiredSide)) {
      desiredSide = this.panes[0].dataset.slot === 'right' ? 'right' : 'left';
    }

    this.panes.forEach((pane) => {
      const isActive = pane.dataset.slot === desiredSide;
      pane.dataset.active = isActive ? 'true' : 'false';
    });

    if (this.row) {
      this.row.dataset.activeSide = desiredSide;
    }

    this.#updateWrapperHeight();
    const activePane = this.panes.find((pane) => pane.dataset.active === 'true');
    if (activePane) {
      this.#initializePaneAssets(activePane);
    }
  }

  #updateWrapperHeight() {
    if (!this.panesWrapper) return;
    const activePane = this.panes.find((pane) => pane.dataset.active === 'true');
    if (!activePane) return;

    const height = activePane.scrollHeight;
    this.panesWrapper.style.setProperty('--dual-row-min-height', `${height}px`);
  }

  /**
   * @param {HTMLElement} pane
   */
  #initializePaneAssets(pane) {
    if (this.lazyInitialized.has(pane)) return;
    this.lazyInitialized.add(pane);

    const lazyNodes = pane.querySelectorAll('[data-lazy-preset]');
    lazyNodes.forEach((node) => {
      const preset = node.dataset.lazyPreset;
      if (!preset) return;
      node.dataset.lazyLoaded = 'true';

      switch (preset) {
        case 'marquee':
          this.#loadModule('marquee');
          break;
        case 'slideshow':
          this.#loadModule('slideshow');
          break;
        default:
          break;
      }
    });
  }

  /**
   * @param {'marquee' | 'slideshow'} moduleName
   */
  async #loadModule(moduleName) {
    if (DualAccordionRow.loadedModules.has(moduleName)) return;

    try {
      switch (moduleName) {
        case 'marquee':
          await import('./marquee.js');
          break;
        case 'slideshow':
          await import('./slideshow.js');
          break;
        default:
          break;
      }
      DualAccordionRow.loadedModules.add(moduleName);
    } catch (error) {
      console.error(`Failed to load ${moduleName} module`, error);
    }
  }

  #updateEmptyState() {
    if (!this.row || !this.summary) return;

    const hasContent = this.panes.some((pane) => pane.dataset.empty !== 'true');
    this.row.dataset.hasContent = hasContent ? 'true' : 'false';

    if (!hasContent) {
      this.summary.dataset.summaryUnderline = 'false';
    }
  }

  /**
   * @param {boolean} isActive
   */
  #applyColorState(isActive) {
    if (!this.row) return;

    const restingClass = this.row.dataset.restingColorClass;
    const activeClass = this.row.dataset.activeColorClass;

    if (!activeClass) return;

    if (isActive) {
      if (restingClass) this.row.classList.remove(restingClass);
      this.row.classList.add(activeClass);
    } else {
      this.row.classList.remove(activeClass);
      if (restingClass) this.row.classList.add(restingClass);
    }
  }
}

const INITIALIZED_KEY = Symbol('dualAccordionRow');

/**
 * @param {ParentNode} scope
 */
function init(scope = document) {
  const detailsList = scope.querySelectorAll('[data-dual-accordion]');

  detailsList.forEach((details) => {
    if (!(details instanceof HTMLDetailsElement)) return;

    if (details[INITIALIZED_KEY]) {
      details[INITIALIZED_KEY].destroy();
    }

    details[INITIALIZED_KEY] = new DualAccordionRow(details);
  });
}

/**
 * @param {ParentNode} scope
 */
function teardown(scope) {
  const detailsList = scope.querySelectorAll('[data-dual-accordion]');

  detailsList.forEach((details) => {
    if (!(details instanceof HTMLDetailsElement)) return;
    details[INITIALIZED_KEY]?.destroy();
    delete details[INITIALIZED_KEY];
  });
}

onDocumentLoaded(() => {
  init();
});

document.addEventListener('shopify:section:load', (event) => {
  if (event.target instanceof HTMLElement) {
    init(event.target);
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  if (event.target instanceof HTMLElement) {
    teardown(event.target);
  }
});
