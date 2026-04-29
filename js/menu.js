
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const menuPanel = document.querySelector('.menu-panel');

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      
      // Alterna atributos de acessibilidade
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuPanel.setAttribute('aria-hidden', isExpanded);
      
      // Alterna as classes visuais
      menuToggle.classList.toggle('menu-toggle--active');
      menuPanel.classList.toggle('is-open');

            // TRAVA O SCROLL DO SITE AO ABRIR O MENU
      document.body.classList.toggle('no-scroll'); 
    });
  }
});
