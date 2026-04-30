document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const percentText = document.querySelector('.preloader__percent');
    
    if (!preloader || !percentText) return;

    // Adiciona classe para travar o scroll inicial apenas se o preloader existir
    document.body.classList.add('is-loading');

    let preloaderFinished = false;
    const maxDuration = 2800;
    let startTime = null;

    function updateProgress(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const rawProgress = Math.min(100, (elapsed / maxDuration) * 100);
        const easedProgress = Math.min(100, Math.round(rawProgress + Math.sin((rawProgress / 100) * Math.PI) * 2));

        percentText.textContent = `${easedProgress}%`;

        if (easedProgress < 100) {
            window.requestAnimationFrame(updateProgress);
        } else {
            finishPreloader();
        }
    }

    window.requestAnimationFrame(updateProgress);

    window.addEventListener('load', () => {
        if (!preloaderFinished) {
            percentText.textContent = '100%';
            finishPreloader();
        }
    });

    setTimeout(() => {
        if (!preloaderFinished) {
            percentText.textContent = '100%';
            finishPreloader();
        }
    }, maxDuration);

    function finishPreloader() {
        if (preloaderFinished) return;
        preloaderFinished = true;

        // Acessibilidade: respeita quem prefere não ver animações complexas
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            preloader.style.opacity = '0';
            preloader.style.transition = 'opacity 0.5s ease';
        } else {
            // Dispara a animação (adiciona a classe que inicia os transitions CSS)
            preloader.classList.add('is-loaded');
        }

        // Remove o preloader do DOM após o tempo da animação (0.5s delay + 1s transform + margem)
        setTimeout(() => {
            preloader.remove();
            document.body.classList.remove('is-loading');
        }, prefersReducedMotion ? 500 : 1600);
    }
});