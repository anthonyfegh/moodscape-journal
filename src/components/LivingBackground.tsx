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

    // Boost saturation by pushing values more aggressively toward their extremes
    const boost = (val: number) => {
      const mid = 127;
      return val > mid ? Math.min(val + 80, 255) : Math.max(val - 50, 0);
    };

    return {
      core: `rgba(${boost(r)}, ${boost(g)}, ${boost(b)}, 0.85)`,
      middle: `rgba(${boost(r)}, ${boost(g)}, ${boost(b)}, 0.55)`,
      outer: `rgba(${r}, ${g}, ${b}, 0.25)`,
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
          width: "600px",
          height: "350px",
          filter: "blur(35px)",
        }}
        initial={false}
        animate={{
          x: ["-15vw", "40vw", "105vw"],
          y: ["-10vh", "50vh", "90vh"],

          rotate: [25, 35, 25],
          background: `radial-gradient(ellipse 40% 60% at 30% 50%, ${cometColors.core} 0%, ${cometColors.middle} 40%, ${cometColors.outer} 70%, transparent 100%)`,
        }}
        transition={{
          x: {
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 25,
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
          width: "500px",
          height: "300px",
          filter: "blur(45px)",
        }}
        initial={false}
        animate={{
          x: ["105vw", "45vw", "-15vw"],
          y: ["90vh", "40vh", "80vh"],

          rotate: [-20, -30, -20],
          background: `radial-gradient(ellipse 45% 55% at 35% 50%, ${cometColors.core} 0%, ${cometColors.middle} 35%, ${cometColors.outer} 65%, transparent 100%)`,
        }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 30,
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
