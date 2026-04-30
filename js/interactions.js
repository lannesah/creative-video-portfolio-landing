// interactions.js
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const menuPanel = document.querySelector('.menu-panel');
  const menuToggle = document.querySelector('.menu-toggle');

  // Ativa o clique no menu (Transforma as 3 linhas em 'X' e abre o painel)
  if (menuToggle && menuPanel) {
    menuToggle.addEventListener('click', () => {
      menuPanel.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active');
      
      const isOpen = menuPanel.classList.contains('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuPanel.setAttribute('aria-hidden', !isOpen);
      
      document.body.classList.toggle('no-scroll', isOpen);
    });
  }

  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        // Scroll suave
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });

        // Fecha o menu lateral se estiver aberto
        if (menuPanel && menuPanel.classList.contains('is-open')) {
          menuPanel.classList.remove('is-open');
          menuPanel.setAttribute('aria-hidden', 'true');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('is-active');
          document.body.classList.remove('no-scroll'); // Libera o scroll do site
        }
      }
    });
  });
});


// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    initVideoHoverEffect();
    initAboutHoverEffect();
    initGlobalParallax();
    initTestimonialsParallaxEffect();
    initTestimonialsSlider();
    initClientsToggle();
    initHeaderScroll();
});

// Função para ativar a transição ao passar o mouse no botão '+'
function initClientsToggle() {
    const cards = document.querySelectorAll('.client-card');
    
    cards.forEach(card => {
        const toggle = card.querySelector('.client-card__toggle');
        
        if (toggle) {
            // Ativa ao passar o cursor no quadradinho
            toggle.addEventListener('mouseenter', () => {
                card.classList.add('is-active');
            });
        }
        
        // Desativa ao retirar o cursor de cima do bloco inteiro
        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-active');
        });
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    const heroSection = document.getElementById('hero');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;

        // 1. Esconde ao rolar para baixo e mostra ao rolar para cima (a partir de uma pequena margem do topo)
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add('site-header--hidden');
        } else {
            header.classList.remove('site-header--hidden');
        }

        // 2. Muda o fundo para Dark quando sair da Hero
        if (currentScrollY > heroHeight - 80) {
            header.classList.add('site-header--dark');
        } else {
            header.classList.remove('site-header--dark');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

function initAboutHoverEffect() {
    const aboutMedia = document.querySelector('.about__media');
    const aboutInner = document.querySelector('.about__inner');

    if (aboutMedia && aboutInner) {
        aboutMedia.addEventListener('mouseenter', () => {
            aboutInner.classList.add('is-hovered');
        });

        aboutMedia.addEventListener('mouseleave', () => {
            aboutInner.classList.remove('is-hovered');
        });
    }
}

function initVideoHoverEffect() {
    const workCards = document.querySelectorAll('.work-card');

    workCards.forEach(card => {
        const video = card.querySelector('.work-card__video');

        if (!video) return; // Se não tiver vídeo no card, ignora

        // Prevenção extra: garante que estão pausados e no início ao carregar a página
        video.pause();
        video.currentTime = 0;

        // Quando o mouse ENTRA no card
        card.addEventListener('mouseenter', () => {
            // video.play() retorna uma Promise. É boa prática tratá-la.
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Impede erros no console caso o navegador bloqueie o autoplay
                    console.log("Play interrompido ou carregando", error);
                });
            }
        });

        // Quando o mouse SAI do card
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // O segredo para mostrar a "capa" (frame 0) novamente
        });
    });
}

function initGlobalParallax() {
    // Pega todas as grandes imagens/blocos que farão parallax
    const parallaxElements = document.querySelectorAll('.hero__image, .about__media, .identity-banner__image, .editorial__image');

    if (parallaxElements.length === 0) return;

    // Guarda os estados de cada elemento independentemente
    const parallaxData = Array.from(parallaxElements).map(el => {
        let container = el.parentElement;
        // Na seção About, usamos o bloco interno maior para referência de visibilidade
        if (el.classList.contains('about__media')) {
            container = el.closest('.about__inner') || container;
        }
        
        return {
            el: el,
            container: container,
            currentY: 0,
            targetY: 0,
            intensity: 10 // O movimento vai de -10% a +10%
        };
    });

    let isAnimating = false;
    let ticking = false;

    // Interpolação linear (Lerp) para o efeito "Premium" suave
    const lerp = (start, end, factor) => start + (end - start) * factor;

    function animate() {
        let needsMoreAnimation = false;

        parallaxData.forEach(data => {
            data.currentY = lerp(data.currentY, data.targetY, 0.08); // 0.08 define a velocidade de suavização

            if (Math.abs(data.targetY - data.currentY) > 0.05) {
                needsMoreAnimation = true;
            } else {
                data.currentY = data.targetY;
            }

            data.el.style.transform = `translate3d(0, ${data.currentY}%, 0)`;
        });

        if (needsMoreAnimation) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
        }
    }

    function updateTarget() {
        const windowHeight = window.innerHeight;

        parallaxData.forEach(data => {
            const rect = data.container.getBoundingClientRect();
            
            // Se o elemento estiver visível na tela
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                
                // targetY define o limite do movimento variando baseado na intensidade
                data.targetY = (progress - 0.5) * (data.intensity * 2); 
            }
        });

        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animate);
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateTarget);
            ticking = true;
        }
    }, { passive: true });

    // Posição inicial forçada para não haver salto no carregamento
    updateTarget();
    parallaxData.forEach(data => {
        data.currentY = data.targetY;
        data.el.style.transform = `translate3d(0, ${data.currentY}%, 0)`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  
  // Seleciona a seção editorial
  const editorialSection = document.querySelector('.editorial');
  
  if (editorialSection) {
    // Configura o observador
    const observerOptions = {
      root: null, // usa o viewport como área de detecção
      rootMargin: "0px",
      // threshold 0.5 significa: ative quando 50% da seção estiver visível na tela
      threshold: 0.5 
    };

    const editorialObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Quando a seção chegar na metade da tela, adiciona a classe dark
          entry.target.classList.add('is-dark');
        } else if (entry.boundingClientRect.top > 0) {
          // Se o usuário rolou para CIMA (a seção saiu por baixo da tela), remove o dark.
          // Se rolou para BAIXO e foi para a seção "Testimonials" (top < 0), o código
          // não entra aqui e o fundo continuará dark!
          entry.target.classList.remove('is-dark');
        }
      });
    }, observerOptions);

    // Inicia a observação da seção
    editorialObserver.observe(editorialSection);
  }

  // Seleciona a seção de depoimentos
  const testimonialsSection = document.querySelector('.testimonials');
  
  if (testimonialsSection) {
    const testimonialsObserverOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5 // Quando a seção estiver 50% visível na tela (50% oculta)
    };

    const testimonialsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Se a seção está sumindo (menos de 50%) e o usuário rolou para baixo (saindo por cima)
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-light');
        } else {
          entry.target.classList.remove('is-light');
        }
      });
    }, testimonialsObserverOptions);

    testimonialsObserver.observe(testimonialsSection);
  }
});

function initTestimonialsParallaxEffect() {
    const section = document.querySelector('.testimonials');
    const titleWrapper = document.querySelector('.testimonials__title-wrapper');

    if (!section || !titleWrapper) return;

    let currentProgress = 0;
    let targetProgress = 0;
    let isAnimating = false;
    let ticking = false;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    function animate() {
        currentProgress = lerp(currentProgress, targetProgress, 0.04); // Deixando o movimento ainda mais suave

        if (Math.abs(targetProgress - currentProgress) < 0.001) {
            currentProgress = targetProgress;
            isAnimating = false;
        }

        // Opacidade de 0.1 (90% de transparência) a 1.0 (Totalmente opaco)
        const opacity = 0.1 + (0.9 * currentProgress);
        
        // Movimento apenas no eixo Y (de baixo para cima, ~150px)
        // O eixo X permanece 0 para não mover para as laterais
        const yOffset = 50 * (1 - currentProgress);

        titleWrapper.style.opacity = opacity;
        titleWrapper.style.transform = `translate3d(0, ${yOffset}px, 0)`;

        if (isAnimating) {
            requestAnimationFrame(animate);
        }
    }

    function updateTarget() {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Começa a animação quando a seção está aproximadamente 10% visível na tela
        const startY = windowHeight - (windowHeight * 0.1); 
        // Termina quando o topo da seção atinge 40% da altura da tela (próximo à centralização)
        const endY = windowHeight * 0.4;

        let progress = (startY - rect.top) / (startY - endY);
        progress = Math.max(0, Math.min(1, progress));

        targetProgress = progress;

        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(animate);
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateTarget);
            ticking = true;
        }
    }, { passive: true });

    // Força a atualização inicial no carregamento da página para não piscar
    updateTarget();
    currentProgress = targetProgress;
    const opacity = 0.1 + (0.9 * currentProgress);
    const yOffset = 0.5 * (1 - currentProgress);
    titleWrapper.style.opacity = opacity;
    titleWrapper.style.transform = `translate3d(0, ${yOffset}px, 0)`;
}

function initTestimonialsSlider() {
    const dots = document.querySelectorAll('.testimonials__dot');
    const slides = document.querySelectorAll('.testimonial-item');

    if (dots.length === 0 || slides.length === 0) return;

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // 1. Remove a classe 'active' de todas as linhas e depoimentos
            dots.forEach(d => d.classList.remove('active'));
            slides.forEach(s => s.classList.remove('active'));

            // 2. Adiciona a classe 'active' apenas na linha clicada
            dot.classList.add('active');
            
            // 3. Mostra o depoimento correspondente à linha clicada
            if (slides[index]) {
                slides[index].classList.add('active');
            }
        });
    });
}   dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // 1. Remove a classe 'active' de todas as linhas e depoimentos
            dots.forEach(d => d.classList.remove('active'));
            slides.forEach(s => s.classList.remove('active'));

            // 2. Adiciona a classe 'active' apenas na linha clicada
            dot.classList.add('active');
            
            // 3. Mostra o depoimento correspondente à linha clicada
            if (slides[index]) {
                slides[index].classList.add('active');
            }
        });
    });
