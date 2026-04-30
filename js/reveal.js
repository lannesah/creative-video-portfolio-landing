
document.addEventListener('DOMContentLoaded', () => {
  // Seleciona todos os elementos que queremos animar
  const revealElements = document.querySelectorAll('.section-heading, .service-card, .work-card, .client-card, .about__content, .about__media-wrap, .news__carousel-wrapper, .news__nav, .footer-col, .footer-divider, .footer-bottom');

  // Configuração do observador (aciona quando 15% do elemento está visível)
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      
      // Adiciona a classe active para disparar a animação CSS
      entry.target.classList.add('active');
      
      // Descomente a linha abaixo se quiser que anime apenas 1 vez
      // observer.unobserve(entry.target); 
    });
  }, revealOptions);

  // Aplica a classe base e começa a observar
  revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    
    // Adiciona delay para elementos em grid baseados na ordem
    if (el.classList.contains('service-card') || el.classList.contains('client-card') || el.classList.contains('footer-col')) {
      let delayClass = 'delay-' + ((index % 3) + 1); // Alterna 1, 2, 3
      el.classList.add(delayClass);
    }
    
    revealOnScroll.observe(el);
  });
});