// Resolve shared photo corrections against the site root, including subdirectory hosting.
(() => {
  const root = new URL('../../', document.currentScript.src);
  const entries = new Map(Object.entries(window.KPI_PHOTO_LAYOUT || {}).map(([path, edit]) => [new URL(path,root).href,edit]));
  function apply(p) {
    if(!p.image)return;
    const edit=entries.get(new URL(p.image,document.baseURI).href);
    if(edit) {
      if(edit.image) {
        p.image=new URL(edit.image,root).href;
        delete p.imageFrame;delete p.imagePresentation;delete p.imageBounds;
        p.imageEdited=true;
      }
      if(!p.imageFrame && !p.imagePresentation && !p.imageBounds && edit.imageBounds)p.imageBounds=edit.imageBounds;
      if(edit.imageFrame)p.imageFrame=edit.imageFrame;
      if(edit.imagePresentation)p.imagePresentation=edit.imagePresentation;
    }
    (p.packagingVariants || []).forEach(apply);
  }
  (window.CATALOG_GROUPS?.flatMap(g=>g.products) || window.KPI_PRODUCTS || []).forEach(apply);
})();
