(() => {
  const button = document.getElementById('animation-toggle');
  const images = document.querySelectorAll('[data-animation]');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !preference.matches;

  function renderAnimations() {
    images.forEach(image => {
      image.src = playing ? image.dataset.animation : image.dataset.poster;
    });
    button.textContent = playing ? 'Pause demonstrations' : 'Play demonstrations';
    button.setAttribute('aria-pressed', String(playing));
  }

  button.hidden = false;
  button.addEventListener('click', () => {
    playing = !playing;
    renderAnimations();
  });
  preference.addEventListener('change', () => {
    playing = !preference.matches;
    renderAnimations();
  });
  renderAnimations();
})();
