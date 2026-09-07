// Aanvullende etiketgegevens uitsluitend voor Meter 3.
(function () {
  const grid = document.querySelector('#product-grid');
  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-product-id]');
    if (!button) return;
    const product = window.KPI_PRODUCTS.find(p => p.id === Number(button.dataset.productId));
    if (!product || !product.nutrition) return;
    const container = document.querySelector('#dialog-content .dialog-product');
    if (!container) return;
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = 'Voedingswaarde per 100 ml';
    section.append(heading);
    const table = document.createElement('table');
    table.className = 'nutrition-table';
    for (const [label, value] of product.nutrition) {
      const row = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = label;
      const td = document.createElement('td');
      td.textContent = value;
      row.append(th, td);
      table.append(row);
    }
    section.append(table);
    const note = document.createElement('p');
    note.textContent = product.nutritionNote;
    section.append(note);
    container.insertBefore(section, container.querySelector('.ean'));
  });
}());
