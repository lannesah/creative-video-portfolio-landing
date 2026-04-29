document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.work__carousel');
  const workSection = document.querySelector('.work');

  if (!carousel || !workSection) {
    return;
  }

  let animationFrameId;
  let isPausedByHover = false;
  const baseSpeed = 0.7; // Velocidade base (mais rápida) em pixels por frame.
  let currentSpeed = baseSpeed;
  let exactScrollLeft = 0; // Armazena o valor decimal para evitar travamentos de arredondamento

  // --- Etapa 1: Calcular tamanho original ANTES de clonar para precisão absoluta ---
  const cssGap = 70; // O gap definido no seu sections.css para a trilha
  const originalContentWidth = carousel.scrollWidth + cssGap;

  // --- Etapa 2: Clonar itens para criar um efeito de loop infinito ---
  const carouselItems = Array.from(carousel.children);
  carouselItems.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    
    // Remove classes de animação do reveal.js para evitar que clones fiquem invisíveis
    clone.classList.remove('reveal', 'active');
    clone.style.opacity = '1';
    clone.style.transform = 'none';

    // Re-aplica eventos de vídeo para os clones funcionarem com play no hover
    const video = clone.querySelector('.work-card__video');
    if (video) {
      clone.addEventListener('mouseenter', () => {
        const playPromise = video.play();
        if (playPromise !== undefined) playPromise.catch(() => {});
      });
      clone.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }

    carousel.appendChild(clone);
  });

  // --- Etapa 3: Função de animação que move o carrossel ---
  function scrollLoop() {
    if (!isPausedByHover) {
      // Mantém a sincronia caso o usuário role manualmente (scroll/trackpad)
      if (Math.abs(carousel.scrollLeft - exactScrollLeft) > 2) {
        exactScrollLeft = carousel.scrollLeft;
      }

      exactScrollLeft += currentSpeed;

      // Reseta para o início de forma invisível ao final do ciclo
      if (exactScrollLeft >= originalContentWidth) {
        exactScrollLeft -= originalContentWidth;
      }
      
      carousel.scrollLeft = exactScrollLeft;
    } else {
      // Mantém sincronizado se o usuário rolar enquanto está pausado (hover)
      exactScrollLeft = carousel.scrollLeft;
    }
    animationFrameId = requestAnimationFrame(scrollLoop);
  }

  // --- Etapa 4: Pausar e retomar via interações ---
  carousel.addEventListener('mouseenter', () => { isPausedByHover = true; });
  carousel.addEventListener('mouseleave', () => { isPausedByHover = false; });

  // --- Etapa 5: Intersection Observer (Controle inteligente da velocidade) ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationFrameId) {
            exactScrollLeft = carousel.scrollLeft; // Atualiza ponto de partida
            animationFrameId = requestAnimationFrame(scrollLoop);
        }
        currentSpeed = entry.intersectionRatio > 0.5 ? baseSpeed / 2 : baseSpeed;
      } else {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    });
  }, { threshold: [0, 0.5, 1.0] });

  observer.observe(workSection);
});





// ---  SESSÃO NEWS:  Interações de vídeo nos cards (mesmo comportamento para os clones) ---

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('newsTrack') || document.querySelector('.news__track');
  if (!track) return;

  // Coleta os cards originais antes de cloná-los
  const originalCards = Array.from(track.querySelectorAll('.news-card'));
  const navLines = document.querySelectorAll('.news__nav-line');
  const newsSection = document.getElementById('news') || document.querySelector('.news');
  const originalCount = originalCards.length;
  
  if (originalCount === 0) return;

  // 1. Clonagem para o Efeito Infinito (Criamos 3 blocos idênticos)
  track.innerHTML = ''; // Limpa a trilha original
  const allCards = [];
  
  for (let i = 0; i < 3; i++) {
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.remove('active'); // Garante que nenhum clone nasça ativo
      track.appendChild(clone);
      allCards.push(clone);
    });
  }

  // O índice real começa no bloco do meio (os originais originais)
  let actualIndex = originalCount; 
  let isSectionVisible = false;
  let isTransitioning = false; // Trava contra duplo clique rápido

  // Função para ligar/desligar as transições e permitir o "teletransporte"
  function setTransitions(active) {
    track.style.transition = active ? '' : 'none';
    allCards.forEach(c => {
      c.style.transition = active ? '' : 'none';
    });
  }

  // Função central para mover o carrossel e gerenciar vídeos
  function updateCarousel(targetIndex, animate = true) {
    setTransitions(animate);

    allCards.forEach((card, i) => {
      const video = card.querySelector('video');
      
      if (i === targetIndex) {
        card.classList.add('active');
        if (video && isSectionVisible) {
          video.loop = true; // Garante que o vídeo fique em looping infinito
          const playPromise = video.play();
          if (playPromise !== undefined) playPromise.catch(() => {});
        }
      } else {
        card.classList.remove('active');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });

    // Atualiza as linhas mantendo-as fiéis ao index original de 0 a (originalCount-1)
    const activeDotIndex = targetIndex % originalCount;
    navLines.forEach((line, i) => {
      line.classList.toggle('active', i === activeDotIndex);
    });

    if (allCards[targetIndex]) {
      const cardWidth = allCards[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(track).gap) || 50; 
      
      const leftOffset = 20;
      const moveAmount = leftOffset - (targetIndex * (cardWidth + gap));
      
      track.style.transform = `translateX(${moveAmount}px)`;
    }
    
    actualIndex = targetIndex;
  }

  // Evento de clique nas linhas de navegação
  navLines.forEach((line, i) => {
    line.addEventListener('click', () => {
      if (isTransitioning) return; // Evita quebra se o usuário clicar várias vezes muito rápido
      
      const currentDot = actualIndex % originalCount;
      let diff = i - currentDot;
      
      // Lógica de "loop infinito": Se está no último vídeo e clicou no primeiro, avança pro clone da frente!
      if (currentDot === originalCount - 1 && i === 0) {
        diff = 1;
      } else if (currentDot === 0 && i === originalCount - 1) {
        diff = -1; // Vai para o clone de trás se do 1º for para o último
      }

      if (diff !== 0) {
        isTransitioning = true;
        updateCarousel(actualIndex + diff, true);
      }
    });
  });

  // Escuta o fim da animação para "teletransportar" silenciosamente de volta pro meio
  track.addEventListener('transitionend', (e) => {
    if (e.target === track && e.propertyName === 'transform') {
      isTransitioning = false;
      
      // Se escorregou para a zona dos clones da direita, pula invisivelmente para os originais
      if (actualIndex >= originalCount * 2) {
        updateCarousel(actualIndex - originalCount, false);
      } 
      // Se foi para os clones da esquerda, pula para os originais
      else if (actualIndex < originalCount) {
        updateCarousel(actualIndex + originalCount, false);
      }
      
      track.offsetHeight; // Força reflow para o navegador registrar a quebra da animação
    }
  });

  // Intersection Observer: Pausa o vídeo se o usuário rolar a página para longe
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isSectionVisible = entry.isIntersecting;
      const activeCard = allCards[actualIndex];
      
      if (activeCard) {
        const activeVideo = activeCard.querySelector('video');
        if (isSectionVisible) {
          if (activeVideo) {
            activeVideo.loop = true; // Garante o looping infinito também ao rolar a página
            activeVideo.play().catch(()=>{});
          }
        } else {
          if (activeVideo) activeVideo.pause();
        }
      }
    });
  }, { threshold: 0.4 }); // Dispara quando 40% da seção aparecer na tela

  if (newsSection) observer.observe(newsSection);

  // Inicializa o layout (com leve atraso para o CSS calcular larguras)
  setTimeout(() => {
    updateCarousel(actualIndex, false);
    // Religa as transições após o posicionamento inicial
    setTimeout(() => setTransitions(true), 50);
  }, 150);

  // Recalcula o centro se o usuário redimensionar a janela
  window.addEventListener('resize', () => {
    updateCarousel(actualIndex, false);
  });
});