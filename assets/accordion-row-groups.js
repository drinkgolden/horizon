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

const initAccordionRow = (row) => {
  if (row.dataset.groupsEnhanced === 'true') return;

  const detailsContent = row.querySelector('.details-content');
  if (!detailsContent) return;

  const groups = Array.from(detailsContent.querySelectorAll('.group-block'));
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
