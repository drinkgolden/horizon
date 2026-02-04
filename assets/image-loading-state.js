const LOADED_ATTR = 'data-image-loaded';

function markLoaded(img) {
  if (!img || img.getAttribute(LOADED_ATTR) === 'true') return;
  img.setAttribute(LOADED_ATTR, 'true');
}

function handleImage(img) {
  if (!(img instanceof HTMLImageElement)) return;

  if (img.complete && img.naturalWidth > 0) {
    markLoaded(img);
    return;
  }

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
