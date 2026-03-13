const LOADED_ATTR = 'data-image-loaded';
const PROMOTED_ATTR = 'data-image-priority-promoted';
const PLACEHOLDER_ASSIGNED_ATTR = 'data-placeholder-color-assigned';
const PROMOTE_ROOT_MARGIN = '800px 0px';
const PLACEHOLDER_COLORS = [
  '#E1B87F',
  '#DB6B30',
  '#92ACA0',
  '#F8B5C4',
  '#0F486E',
  '#A62D3B',
  '#EED484',
];
const PLACEHOLDER_HOST_SELECTORS = [
  'placeholder-image',
  '.placeholder-image',
  '.product-media',
  '.product-media-container',
  '.card-gallery',
  '.media-block__media',
];

let priorityObserver = null;
let placeholderColorBag = [];
let lastAssignedPlaceholderColor = '';

function shuffleColors(colors) {
  const next = [...colors];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function getNextPlaceholderColor() {
  if (!placeholderColorBag.length) {
    placeholderColorBag = shuffleColors(PLACEHOLDER_COLORS);

    if (
      placeholderColorBag.length > 1 &&
      lastAssignedPlaceholderColor &&
      placeholderColorBag[0] === lastAssignedPlaceholderColor
    ) {
      const swapIndex = placeholderColorBag.findIndex(
        (color, index) => index > 0 && color !== lastAssignedPlaceholderColor
      );

      if (swapIndex > 0) {
        [placeholderColorBag[0], placeholderColorBag[swapIndex]] = [
          placeholderColorBag[swapIndex],
          placeholderColorBag[0],
        ];
      }
    }
  }

  const nextColor = placeholderColorBag.shift() || PLACEHOLDER_COLORS[0];
  lastAssignedPlaceholderColor = nextColor;
  return nextColor;
}

function isHeaderLogoImage(img) {
  return (
    img.classList.contains('header-logo__image') ||
    Boolean(img.closest('.header-logo'))
  );
}

function findPlaceholderHost(img) {
  for (const selector of PLACEHOLDER_HOST_SELECTORS) {
    const host = img.closest(selector);
    if (host) return host;
  }

  return img;
}

function assignPlaceholderColor(img) {
  if (!(img instanceof HTMLImageElement) || isHeaderLogoImage(img)) return;

  const host = findPlaceholderHost(img);
  if (!(host instanceof HTMLElement) || host.getAttribute(PLACEHOLDER_ASSIGNED_ATTR) === 'true') {
    return;
  }

  host.style.setProperty('--image-placeholder-color', getNextPlaceholderColor());
  host.setAttribute(PLACEHOLDER_ASSIGNED_ATTR, 'true');
}

function markLoaded(img) {
  if (!img || img.getAttribute(LOADED_ATTR) === 'true') return;
  img.setAttribute(LOADED_ATTR, 'true');
}

function handleImage(img) {
  if (!(img instanceof HTMLImageElement)) return;
  if (isHeaderLogoImage(img)) {
    markLoaded(img);
    return;
  }

  if (priorityObserver && img.loading === 'lazy') {
    priorityObserver.observe(img);
  }

  if (img.complete) {
    markLoaded(img);
    return;
  }

  assignPlaceholderColor(img);

  img.addEventListener('load', () => markLoaded(img), { once: true });
  img.addEventListener('error', () => markLoaded(img), { once: true });
}

function handleNode(node) {
  if (node instanceof HTMLImageElement) {
    handleImage(node);
    return;
  }

  if (!(node instanceof Element)) return;

  const images = node.querySelectorAll('img');
  images.forEach((img) => handleImage(img));
}

function init() {
  if ('IntersectionObserver' in window) {
    priorityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        if (!(img instanceof HTMLImageElement)) return;
        if (img.getAttribute(PROMOTED_ATTR) === 'true') {
          priorityObserver.unobserve(img);
          return;
        }

        img.setAttribute(PROMOTED_ATTR, 'true');
        if (img.loading === 'lazy') {
          img.loading = 'eager';
        }
        img.setAttribute('fetchpriority', 'high');
        priorityObserver.unobserve(img);
      });
    }, { rootMargin: PROMOTE_ROOT_MARGIN, threshold: 0 });
  }

  document.querySelectorAll('img').forEach((img) => handleImage(img));

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => handleNode(node));
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
