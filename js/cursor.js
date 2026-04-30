document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  // Desativa em dispositivos touch e quando a preferência do sistema é por movimento reduzido (Acessibilidade)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice || prefersReducedMotion) {
    cursor.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 3;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  const baseSize = 30; // Tamanho base em px (igual ao width/height do CSS)
  let targetSize = baseSize;
  let currentSize = baseSize;
  let isVisible = false;

  // Seletores inteligentes - Todos os elementos que farão a bolinha expandir (inclui os elementos customizados que já existem na sua landing page)
  const hoverSelectors = 'a, button, .cursor-expand, .work-card, .client-card, .service-card, .news-card, .testimonials__dot, .news__nav-line';

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isVisible) {
      cursor.style.opacity = '1';
      isVisible = true;
      // Inicializa a posição exatamente onde o mouse entrou, evitando trilha longa indesejada
      cursorX = mouseX;
      cursorY = mouseY;
    }
  });

  document.addEventListener('mouseover', (e) => {
    const hoverable = e.target.closest(hoverSelectors);
    if (hoverable) {
      targetSize = baseSize * 4;
    } else {
      targetSize = baseSize;
    }
  });

  // Esconde o cursor elegantemente se o mouse sair da janela do navegador
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    isVisible = false;
  });

  const lerp = (start, end, factor) => start + (end - start) * factor;

  function render() {
    // Interpolação linear (lerp) para criar o "trailing/easing" premium e o crescimento suave de escala
    cursorX = lerp(cursorX, mouseX, 0.15);
    cursorY = lerp(cursorY, mouseY, 0.15);
    currentSize = lerp(currentSize, targetSize, 0.15);

    cursor.style.width = `${currentSize}px`;
    cursor.style.height = `${currentSize}px`;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
});