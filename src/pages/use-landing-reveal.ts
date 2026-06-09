import { useEffect, type RefObject } from 'react';

export function useLandingReveal(mainRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const targets = root.querySelectorAll('.landing__reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('landing__reveal--in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mainRef]);
}
