const figure = document.querySelector('.embedding-explorer');

if (figure) {
  const controls = figure.querySelector('.embedding-controls');
  const buttons = controls.querySelectorAll('button');
  const label = figure.querySelector('.embedding-view-label');
  const labels = { pca: 'PCA', umap: 'UMAP', both: 'PCA and UMAP' };

  function showProjection(view) {
    figure.dataset.view = view;
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.projection === view));
    });
    label.textContent = labels[view] + ' · original report figure';
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => showProjection(button.dataset.projection));
  });
  controls.hidden = false;
  showProjection('umap');
}
