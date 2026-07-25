import 'cypress-real-events';

// MUI's Accordion expand transition races with realClick on elements inside
// it (e.g. the Table tab in DataContainer), causing intermittent failures.
// Disabling CSS transitions/animations keeps element positions stable.
Cypress.on('window:before:load', (win) => {
  const inject = () => {
    const style = win.document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        transition: none !important;
        animation: none !important;
      }
    `;
    win.document.head.appendChild(style);
  };

  if (win.document.head) {
    inject();
  } else {
    win.document.addEventListener('DOMContentLoaded', inject);
  }
});
