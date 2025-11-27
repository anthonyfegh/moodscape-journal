import { motion } from "framer-motion";
import { useMemo } from "react";

interface LivingBackgroundProps {
  moodColor: string;
}

export const LivingBackground = ({ moodColor }: LivingBackgroundProps) => {
  // Simpler tie-dye: gentle watercolor wash
  const backgroundGradients = useMemo(() => {
    const hex = moodColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return [
      `rgba(${r}, ${g}, ${b}, 0.08)`,
      `rgba(${Math.min(r + 30, 255)}, ${Math.min(g + 30, 255)}, ${Math.min(b + 30, 255)}, 0.06)`,
      `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 0.07)`,
    ];
  }, [moodColor]);

  // Comet glow: saturated, concentrated emotion
  const cometColors = useMemo(() => {
    const hex = moodColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Boost saturation by pushing values toward their extremes
    const boost = (val: number) => {
      const mid = 127;
      return val > mid ? Math.min(val + 50, 255) : Math.max(val - 30, 0);
    };

    return {
      core: `rgba(${boost(r)}, ${boost(g)}, ${boost(b)}, 0.7)`,
      middle: `rgba(${boost(r)}, ${boost(g)}, ${boost(b)}, 0.4)`,
      outer: `rgba(${r}, ${g}, ${b}, 0.15)`,
    };
  }, [moodColor]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Soft emotional fog - simple tie-dye */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          background: `
            radial-gradient(circle at 25% 40%, ${backgroundGradients[0]} 0%, transparent 55%),
            radial-gradient(circle at 75% 30%, ${backgroundGradients[1]} 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, ${backgroundGradients[2]} 0%, transparent 60%)
          `,
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
        }}
        style={{
          backgroundColor: "hsl(var(--background))",
        }}
      />

      {/* Main comet - elliptical shape with bright core and directional tail */}
      <motion.div
        className="absolute"
        style={{
          width: "500px",
          height: "300px",
          filter: "blur(40px)",
        }}
        initial={false}
        animate={{
          x: ["-30vw", "30vw", "90vw"],
          y: ["-10vh", "40vh", "80vh"],

          rotate: [25, 35, 25],
          background: `radial-gradient(ellipse 40% 60% at 30% 50%, ${cometColors.core} 0%, ${cometColors.middle} 40%, ${cometColors.outer} 70%, transparent 100%)`,
        }}
        transition={{
          x: {
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          },
          background: {
            duration: 2,
            ease: "easeInOut",
          },
        }}
      />

      {/* Secondary comet - adds depth and movement variation */}
      <motion.div
        className="absolute"
        style={{
          width: "400px",
          height: "250px",
          filter: "blur(50px)",
        }}
        initial={false}
        animate={{
          x: ["90vw", "30vw", "-20vw"],
          y: ["70vh", "30vh", "60vh"],

          rotate: [-20, -30, -20],
          background: `radial-gradient(ellipse 45% 55% at 35% 50%, ${cometColors.core} 0%, ${cometColors.middle} 35%, ${cometColors.outer} 65%, transparent 100%)`,
        }}
        transition={{
          x: {
            duration: 42,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: 42,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 42,
            repeat: Infinity,
            ease: "easeInOut",
          },
          background: {
            duration: 2,
            ease: "easeInOut",
          },
        }}
      />
    </div>
  );
};
