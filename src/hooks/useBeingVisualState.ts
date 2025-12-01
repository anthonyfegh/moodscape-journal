import { useState, useEffect, useRef } from 'react';
import { RenderState, interpolateRenderState } from '@/consciousness';

/**
 * Hook for smoothly interpolating between RenderStates
 * Ensures all visual transitions are fluid and organic
 */
export const useBeingVisualState = (targetState: RenderState, smoothingDuration: number = 300) => {
  const [currentState, setCurrentState] = useState<RenderState>(targetState);
  const animationRef = useRef<number>();
  const startStateRef = useRef<RenderState>(targetState);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Set new animation target
    startStateRef.current = currentState;
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const t = Math.min(elapsed / smoothingDuration, 1);
      
      // Smooth easing function (ease-out cubic)
      const easedT = 1 - Math.pow(1 - t, 3);

      const interpolated = interpolateRenderState(
        startStateRef.current,
        targetState,
        easedT
      );

      setCurrentState(interpolated);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetState, smoothingDuration]);

  return currentState;
};
