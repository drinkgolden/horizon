const SLOT_NAMES = ['left', 'right'];

const determineSlot = (element) => {
  if (!element) return '';
  const explicit = (element.getAttribute('data-group-slot') || element.dataset.groupSlot || '').trim().toLowerCase();
  if (SLOT_NAMES.includes(explicit)) return explicit;

  const labelSources = [
    element.getAttribute('data-block-label'),
    element.getAttribute('aria-label'),
    element.getAttribute('data-label'),
  ];

  for (const source of labelSources) {
    if (!source) continue;
    const normalized = source.toLowerCase();
    if (normalized.includes('left')) return 'left';
    if (normalized.includes('right')) return 'right';
  }

  const slotClass = Array.from(element.classList).find((className) => className.startsWith('slot-'));
  if (slotClass) {
    const candidate = slotClass.replace('slot-', '').toLowerCase();
    if (SLOT_NAMES.includes(candidate)) return candidate;
  }

  return '';
};

const SLOT_CLASS_LEFT = 'accordion-row__group--left';
const SLOT_CLASS_RIGHT = 'accordion-row__group--right';

const showGroup = (groups, target) => {
  if (!target) return;
  groups.forEach((group) => {
    group.classList.toggle('accordion-row__group-hidden', group !== target);
  });
};

const attachInteractionHandlers = (element, handler) => {
  if (!element) return;
  ['mouseenter', 'focus', 'click'].forEach((eventName) => {
    element.addEventListener(eventName, handler);
  });
};

const COLOR_CLASS_PREFIX = 'color-';

const ensureBaseColorClass = (row) => {
  if (!row) return;
  if (!row.dataset.baseColorClass) {
    const baseClass = Array.from(row.classList).find((className) => className.startsWith(COLOR_CLASS_PREFIX)) || '';
    row.dataset.baseColorClass = baseClass;
    row.dataset.currentColorClass = baseClass;
  } else if (!row.dataset.currentColorClass) {
    row.dataset.currentColorClass = row.dataset.baseColorClass;
  }
};

const applyColorClass = (row, className) => {
  if (!row) return;
  const current = row.dataset.currentColorClass;
  if (current && current !== className) {
    row.classList.remove(current);
  }
  if (className && current !== className) {
    row.classList.add(className);
  }
  row.dataset.currentColorClass = className || '';
};

const setActiveHoverScheme = (row, schemeId) => {
  if (!row) return;
  ensureBaseColorClass(row);
  const normalized = schemeId || '';
  row.dataset.activeHoverScheme = normalized;
  const baseClass = row.dataset.baseColorClass || '';
  const targetClass = normalized ? `${COLOR_CLASS_PREFIX}${normalized}` : baseClass;
  applyColorClass(row, targetClass);
};

const getSchemeForSide = (row, side) => {
  if (!row) return '';
  const prioritizedSchemes =
    side === 'right'
      ? [row.dataset.rightHoverScheme, row.dataset.leftHoverScheme]
      : [row.dataset.leftHoverScheme, row.dataset.rightHoverScheme];

  const fallback =
    prioritizedSchemes.find((value) => value && value.length) ||
    row.dataset.hoverScheme ||
    row.dataset.baseColorScheme ||
    '';

  return fallback;
};

const bindHoverSchemes = (row) => {
  if (!row || row.dataset.hoverSplit !== 'true' || row.dataset.hoverSchemesBound === 'true') return;

  const leftHeading = row.querySelector('.details__heading--left');
  const rightHeading = row.querySelector('.details__heading--right');
  if (!leftHeading && !rightHeading) return;

  const detailsElement = row.querySelector('details');
  const applySide = (side) => {
    const scheme = getSchemeForSide(row, side);
    row.dataset.lastActivatedSide = side;
    setActiveHoverScheme(row, scheme);
  };

  if (leftHeading) {
    attachInteractionHandlers(leftHeading, () => applySide('left'));
  }

  if (rightHeading) {
    attachInteractionHandlers(rightHeading, () => applySide('right'));
  }

  row.addEventListener('mouseleave', () => {
    if (row.classList.contains('accordion-row--open')) return;
    setActiveHoverScheme(row, '');
  });

  const getDefaultSide = () => {
    if (row.dataset.lastActivatedSide) return row.dataset.lastActivatedSide;
    if (row.dataset.leftHoverScheme && leftHeading) return 'left';
    if (row.dataset.rightHoverScheme && rightHeading) return 'right';
    return leftHeading ? 'left' : 'right';
  };

  if (detailsElement) {
    detailsElement.addEventListener('toggle', () => {
      if (!detailsElement.hasAttribute('open')) {
        setActiveHoverScheme(row, '');
      } else if (!row.dataset.activeHoverScheme) {
        applySide(getDefaultSide());
      }
    });
  }

  if (row.classList.contains('accordion-row--open')) {
    applySide(getDefaultSide());
  }

  row.dataset.hoverSchemesBound = 'true';
};

const bindRowOpenState = (row) => {
  if (!row || row.dataset.openStateBound === 'true') return;
  const detailsElement = row.querySelector('details');
  if (!detailsElement) return;

  const updateOpenState = () => {
    row.classList.toggle('accordion-row--open', detailsElement.hasAttribute('open'));
  };

  detailsElement.addEventListener('toggle', updateOpenState);
  updateOpenState();
  row.dataset.openStateBound = 'true';
};

const initAccordionRow = (row) => {
  bindRowOpenState(row);
  bindHoverSchemes(row);

  if (row.dataset.groupsEnhanced === 'true') return;

  const detailsContent = row.querySelector('.details-content');
  if (!detailsContent) return;

  const groups = Array.from(detailsContent.querySelectorAll('.group-block'));
  if (!groups.length) return;

  const groupMode = (row.dataset.groupMode || 'split').toLowerCase();

  const resetGroup = (group) => {
    group.classList.remove(SLOT_CLASS_LEFT, SLOT_CLASS_RIGHT, 'accordion-row__group-hidden');
    group.style.removeProperty('margin-inline-start');
    group.style.removeProperty('margin-inline-end');
    const content = group.querySelector('.group-block-content');
    if (content) {
      content.style.removeProperty('--horizontal-alignment');
      content.style.removeProperty('--horizontal-alignment-mobile');
    }
  };

  groups.forEach(resetGroup);

  if (groupMode === 'shared') {
    groups.forEach((group, index) => {
      if (index > 0) {
        group.classList.add('accordion-row__group-hidden');
      }
    });
    row.dataset.groupsEnhanced = 'true';
    return;
  }

  if (groups.length < 2) return;

  const leftHeading = row.querySelector('.details__heading--left');
  const rightHeading = row.querySelector('.details__heading--right');
  if (!rightHeading) return;

  const groupedBySlot = groups.reduce(
    (acc, group) => {
      const slot = determineSlot(group);
      if (slot && !acc[slot]) {
        acc[slot] = group;
      }
      return acc;
    },
    { left: null, right: null }
  );

  const leftGroup = groupedBySlot.left || groups[0];
  const rightGroup = groupedBySlot.right || groups.find((group) => group !== leftGroup);

  if (!leftGroup || !rightGroup) return;

  const markSlot = (group, slot) => {
    if (!group) return;
    group.classList.remove(SLOT_CLASS_LEFT, SLOT_CLASS_RIGHT);
    if (slot === 'left') {
      group.classList.add(SLOT_CLASS_LEFT);
    } else if (slot === 'right') {
      group.classList.add(SLOT_CLASS_RIGHT);
    }

    const content = group.querySelector('.group-block-content');
    if (content) {
      const alignment = slot === 'right' ? 'flex-end' : 'flex-start';
      content.style.setProperty('--horizontal-alignment', alignment);
      content.style.setProperty('--horizontal-alignment-mobile', alignment);
    }

    group.style.setProperty('margin-inline-start', slot === 'right' ? 'auto' : '0');
    group.style.setProperty('margin-inline-end', slot === 'right' ? '0' : 'auto');
  };

  markSlot(leftGroup, 'left');
  markSlot(rightGroup, 'right');

  showGroup(groups, leftGroup);

  attachInteractionHandlers(leftHeading, () => showGroup(groups, leftGroup));
  attachInteractionHandlers(rightHeading, () => showGroup(groups, rightGroup));

  row.dataset.groupsEnhanced = 'true';
};

const initAccordionRows = (root = document) => {
  const rows = root.querySelectorAll('.accordion-row');
  rows.forEach(initAccordionRow);
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initAccordionRows();
} else {
  document.addEventListener('DOMContentLoaded', () => initAccordionRows());
}

document.addEventListener('shopify:section:load', (event) => {
  initAccordionRows(event.target);
});

document.addEventListener('shopify:block:select', (event) => {
  initAccordionRows(event.target);
});
