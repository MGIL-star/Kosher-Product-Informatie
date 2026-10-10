// Give oversized words a balanced break without adding visible hyphens.
(() => {
  const remembered = new WeakMap();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let timer;
  function update() {
    document.querySelectorAll('.card-copy h3, .card-text strong').forEach(title => {
      const style = getComputedStyle(title);
      const width = title.clientWidth;
      if (!width) return;
      const key = [title.textContent, width, style.font].join('|');
      if (remembered.get(title) === key) return;
      remembered.set(title, key);
      title.querySelectorAll('wbr[data-card-wrap]').forEach(el => el.remove());
      title.normalize();
      ctx.font = style.font;
      const nodes = [];
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        let changed = false;
        node.textContent.split(/(\s+)/).forEach(word => {
          const measured = ctx.measureText(word).width;
          if (measured <= width || word.length < 6) {
            fragment.append(document.createTextNode(word));
            return;
          }
          changed = true;
          const chars = Array.from(word);
          const count = Math.ceil(measured / width);
          const size = Math.ceil(chars.length / count);
          const compound = word.match(/^(chocolade|bosvruchten|champignon|mineraalwater|gezichtjes|aardbeien|vanille|sinaasappel|volkoren|karamel)(.{4,})$/i);
          const parts = compound && ctx.measureText(compound[1]).width <= width && ctx.measureText(compound[2]).width <= width
            ? [compound[1], compound[2]]
            : Array.from({ length: count }, (_, i) => chars.slice(i * size, (i + 1) * size).join(''));
          parts.forEach((part, i) => {
            if (i) {
              const br = document.createElement('wbr');
              br.dataset.cardWrap = '';
              fragment.append(br);
            }
            fragment.append(document.createTextNode(part));
          });
        });
        if (changed) node.replaceWith(fragment);
      });
    });
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(update, 100); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  schedule();
})();
