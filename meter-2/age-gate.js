(function () {
  'use strict';
  const page = document.querySelector('#catalog-page');
  const welcome = document.createElement('div');
  welcome.className = 'age-welcome';
  welcome.innerHTML = `<section class="age-gate" role="status" aria-live="polite">
    <h1>Welkom bij onze Israëlische wijnen</h1>
    <p>Ontdek ons assortiment en vind een wijn voor jouw bijzondere moment.</p>
    <span class="age-number">18+</span>
    <p>Geniet bewust. Onze alcoholhoudende dranken zijn voor iedereen van 18 jaar en ouder.</p>
    <p class="age-next">Je ontdekt ons aanbod over enkele ogenblikken.</p>
    <span class="age-progress" aria-hidden="true"></span>
  </section>`;
  document.body.append(welcome);
  // Informational welcome; no age confirmation or access restriction.
  window.setTimeout(() => {
    page.hidden = false;
    page.inert = false;
    document.body.classList.remove('age-pending');
    welcome.remove();
  }, 10000);
}());
