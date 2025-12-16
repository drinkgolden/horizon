document.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('[data-rotate-toggle]') : null;
  if (!button) return;

  event.preventDefault();
  event.stopPropagation();

  const nextState = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(nextState));

  const gallery = button.closest('.card-gallery');
  gallery?.classList.toggle('card-gallery--rotated', nextState);
});
