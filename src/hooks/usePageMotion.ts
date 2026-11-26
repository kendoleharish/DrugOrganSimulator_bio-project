import { useLayoutEffect, type RefObject } from 'react';

/** One-time entrances and a bounded stage offset, driven by user scrolling. */
export function usePageMotion(root: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const container = root.current;
    if (!container) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'));
    const stage = container.querySelector<HTMLElement>('.scene-parallax');
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    function revealAll() {
      observer?.disconnect();
      targets.forEach(target => {
        target.dataset.revealState = 'visible';
        target.style.removeProperty('--reveal-delay');
      });
    }

    function configure() {
      observer?.disconnect();
      if (preference.matches || !('IntersectionObserver' in window)) {
        revealAll();
        stage?.style.removeProperty('--stage-parallax');
        cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.revealState = 'visible';
          observer?.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      targets.forEach((target, index) => {
        if (target.dataset.revealState === 'visible') return;
        target.style.setProperty('--reveal-delay', `${(index % 3) * 80}ms`);
        target.dataset.revealState = 'pending';
        observer?.observe(target);
      });
    }

    function updateStage() {
      frame = 0;
      if (preference.matches || !stage) return;
      const bounds = stage.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      const center = bounds.top + bounds.height / 2;
      const offset = Math.max(-8, Math.min(8, (innerHeight / 2 - center) * 0.015));
      stage.style.setProperty('--stage-parallax', `${offset.toFixed(2)}px`);
    }

    function scheduleStage() {
      if (!preference.matches && !frame) frame = requestAnimationFrame(updateStage);
    }

    configure();
    preference.addEventListener('change', configure);
    window.addEventListener('scroll', scheduleStage, { passive: true });
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', configure);
      window.removeEventListener('scroll', scheduleStage);
      targets.forEach(target => {
        delete target.dataset.revealState;
        target.style.removeProperty('--reveal-delay');
      });
      stage?.style.removeProperty('--stage-parallax');
    };
  }, [root]);
}
