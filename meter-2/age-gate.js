(function () {
  'use strict';
  const page = document.querySelector('#catalog-page');
  const welcome = document.createElement('div');
  welcome.className = 'age-welcome';
  welcome.innerHTML = `<section class="age-gate" role="status" aria-live="polite">
    <span class="age-number">18+</span>
    <h1>Welkom bij meter 2</h1>
    <p>Ontdek onze wijnen en dranken.<br>Alcohol is voor 18 jaar en ouder.</p>
    <p class="age-next">Je gaat zo vanzelf verder.</p>
    <span class="age-progress" aria-hidden="true"></span>
  </section>`;
  document.body.append(welcome);
  // Informational welcome; no age confirmation or access restriction.
  window.setTimeout(() => {
    page.hidden = false;
    page.inert = false;
    document.body.classList.remove('age-pending');
    welcome.remove();
  }, 2200);
}());
