import { useEffect, useRef } from 'react';

export const useScrollReveal = (options = { threshold: 0.15 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible');
        
        // Stagger children if it's a container
        const children = element.querySelectorAll('.scroll-reveal-child');
        children.forEach((child, index) => {
          child.style.transitionDelay = `${index * 100}ms`;
          child.classList.add('is-visible');
        });
        
        // Unobserve after revealing
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options.threshold]);

  return ref;
};
