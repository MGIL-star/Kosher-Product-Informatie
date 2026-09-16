// Fit the visible packaging, rather than the website image's surrounding whitespace.
// Original image files and the shared card/dialog layout remain unchanged.
(() => {
  const bounds = new Map(window.KPI_PRODUCTS.filter(p => p.imageBounds)
    .map(p => [new URL(p.image, document.baseURI).href, p.imageBounds]));
  const resize = new ResizeObserver(entries => entries.forEach(({ target }) => fit(target)));

  function fit(frame) {
    const img = frame.querySelector('img');
    const box = img && bounds.get(img.src);
    if (!box || !img.naturalWidth || !frame.clientWidth) return;
    img.style.removeProperty('padding');
    const padding = parseFloat(getComputedStyle(img).paddingTop) || 0;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const bw = (box[2] - box[0]) * width;
    const bh = (box[3] - box[1]) * height;
    const packScale = Number(frame.dataset.packScale || 1);
    const scale = Math.min((frame.clientWidth - 2 * padding) / bw,
      (frame.clientHeight - 2 * padding) / bh) * packScale;
    Object.assign(frame.style, { overflow: 'hidden', background: '#fff' });
    Object.assign(img.style, {
      clipPath: `inset(${box[1] * 100}% ${(1 - box[2]) * 100}% ${(1 - box[3]) * 100}% ${box[0] * 100}%)`,
      position: 'absolute', padding: '0', maxWidth: 'none', maxHeight: 'none',
      width: `${width * scale}px`, height: `${height * scale}px`,
      left: `${(frame.clientWidth - bw * scale) / 2 - box[0] * width * scale}px`,
      top: `${(packScale < 1 ? frame.clientHeight - padding - bh * scale : (frame.clientHeight - bh * scale) / 2) - box[1] * height * scale}px`
    });
  }

  function scan() {
    resize.disconnect();
    document.querySelectorAll('.product-visual:has(img)').forEach(frame => {
      const img = frame.querySelector('img');
      img.onload = () => fit(frame);
      resize.observe(frame);
      fit(frame);
    });
  }
  const mutations = new MutationObserver(scan);
  ['product-grid', 'dialog-content'].forEach(id => {
    mutations.observe(document.getElementById(id), { childList: true, subtree: true });
  });
  scan();
})();
