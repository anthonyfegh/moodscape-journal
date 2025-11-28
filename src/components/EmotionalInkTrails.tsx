import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InkParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
}

interface EmotionalInkTrailsProps {
  isTyping: boolean;
  moodColor: string;
  caretPosition: { x: number; y: number } | null;
}

export const EmotionalInkTrails = ({
  isTyping,
  moodColor,
  caretPosition,
}: EmotionalInkTrailsProps) => {
  const [particles, setParticles] = useState<InkParticle[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    if (!isTyping || !caretPosition) return;

    // Generate a new particle at the caret position
    const interval = setInterval(() => {
      const newParticle: InkParticle = {
        id: `particle-${particleIdRef.current++}`,
        x: caretPosition.x + (Math.random() - 0.5) * 8,
        y: caretPosition.y + (Math.random() - 0.5) * 8,
        size: Math.random() * 6 + 3,
        opacity: Math.random() * 0.15 + 0.05,
        rotation: Math.random() * 360,
      };

      setParticles((prev) => [...prev, newParticle]);

      // Remove particle after fade duration
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1500);
    }, 100);

    return () => clearInterval(interval);
  }, [isTyping, caretPosition]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: particle.opacity,
              scale: 1,
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 20,
              y: particle.y + Math.random() * 15,
              opacity: 0,
              scale: 1.5,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            className="absolute rounded-full blur-sm"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: moodColor,
              transform: `rotate(${particle.rotation}deg)`,
              boxShadow: `0 0 ${particle.size * 2}px ${moodColor}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
