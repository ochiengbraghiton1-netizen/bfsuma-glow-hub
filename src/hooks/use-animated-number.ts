import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook that smoothly animates a number from its previous value to a new target.
 * Uses requestAnimationFrame for 60fps transitions with ease-out easing.
 */
export function useAnimatedNumber(target: number, duration = 400): number {
  const [display, setDisplay] = useState(target);
  const animRef = useRef<number | null>(null);
  const startVal = useRef(target);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    startVal.current = display;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth, trust-building deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = startVal.current + (target - startVal.current) * eased;
      setDisplay(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return display;
}
