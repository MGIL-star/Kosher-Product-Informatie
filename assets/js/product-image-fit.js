// Display the original website photographs front-on in the shared photo frames.
// Source files are untouched. Corners describe the visible front of each package.
(() => {
  'use strict';
  const presentations = new Map(window.KPI_PRODUCTS.map(product =>
    [new URL(product.image, document.baseURI).href, product.imagePresentation]));

  function projection(source, target) {
    const rows = source.flatMap(([x, y], index) => {
      const [u, v] = target[index];
      return [[x,y,1,0,0,0,-u*x,-u*y,u], [0,0,0,x,y,1,-v*x,-v*y,v]];
    });
    for (let col = 0; col < 8; col++) {
      let pivot = col;
      for (let row = col + 1; row < 8; row++) {
        if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
      }
      [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
      const divisor = rows[col][col];
      if (Math.abs(divisor) < 1e-12) return null;
      rows[col] = rows[col].map(value => value / divisor);
      for (let row = 0; row < 8; row++) {
        if (row === col) continue;
        const factor = rows[row][col];
        rows[row] = rows[row].map((value, index) => value - factor * rows[col][index]);
      }
    }
    const [a,b,c,d,e,f,g,h] = rows.map(row => row[8]);
    return `matrix3d(${[a,d,0,g,b,e,0,h,0,0,1,0,c,f,0,1].join(',')})`;
  }

  function fit(frame) {
    const img = frame.querySelector('img');
    const presentation = img && presentations.get(img.src);
    if (!presentation || !img.naturalWidth || !frame.clientWidth) return;
    // Read the same responsive padding as the other meters before overriding it.
    img.style.removeProperty('padding');
    const padding = parseFloat(getComputedStyle(img).paddingTop) || 0;
    const ratio = presentation.aspectRatio;
    const height = Math.min(frame.clientHeight - 2 * padding,
      (frame.clientWidth - 2 * padding) / ratio);
    const width = height * ratio;
    const left = (frame.clientWidth - width) / 2;
    const top = (frame.clientHeight - height) / 2;
    // Downsample before the perspective transform, so small cards use the browser's
    // high-quality image resizer instead of shrinking a full-size GPU texture.
    const xs = presentation.corners.map(([x]) => x);
    const renderWidth = 2 * width / (Math.max(...xs) - Math.min(...xs));
    const renderHeight = renderWidth * img.naturalHeight / img.naturalWidth;
    const source = presentation.corners.map(([x,y]) => [x * renderWidth, y * renderHeight]);
    const transform = projection(source, [[left,top],[left+width,top],[left+width,top+height],[left,top+height]]);
    if (!transform) return;
    Object.assign(frame.style, {position:'relative', overflow:'hidden', background:'#fff'});
    Object.assign(img.style, {
      position:'absolute', left:'0', top:'0', padding:'0', maxWidth:'none', maxHeight:'none',
      width:`${renderWidth}px`, height:`${renderHeight}px`,
      transformOrigin:'0 0', transform,
      clipPath:`polygon(${presentation.corners.map(([x,y]) => `${x*100}% ${y*100}%`).join(',')})`
    });
  }

  const resize = new ResizeObserver(entries => entries.forEach(({target}) => fit(target)));
  function scan() {
    resize.disconnect();
    document.querySelectorAll('.product-visual:has(img)').forEach(frame => {
      frame.querySelector('img').onload = () => fit(frame);
      resize.observe(frame);
      fit(frame);
    });
  }
  const observer = new MutationObserver(scan);
  ['product-grid', 'dialog-content'].forEach(id =>
    observer.observe(document.getElementById(id), {childList:true, subtree:true}));
  scan();
})();
