import { motion } from "framer-motion";
import { useMemo } from "react";

interface LivingBackgroundProps {
  moodColor: string;
}

export const LivingBackground = ({ moodColor }: LivingBackgroundProps) => {
  // Generate color variations for tie-dye effect
  const colorVariations = useMemo(() => {
    // Convert hex to RGB
    const hex = moodColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Create variations: lighter, darker, more saturated, less saturated
    const variations = [
      `rgba(${r}, ${g}, ${b}, 0.15)`, // base soft
      `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, 0.12)`, // lighter
      `rgba(${Math.max(r - 30, 0)}, ${Math.max(g - 30, 0)}, ${Math.max(b - 30, 0)}, 0.18)`, // darker
      `rgba(${Math.min(r + 20, 255)}, ${g}, ${b}, 0.1)`, // warmer
      `rgba(${r}, ${Math.min(g + 20, 255)}, ${Math.min(b + 20, 255)}, 0.13)`, // cooler
    ];

    return variations;
  }, [moodColor]);

  // Glow color (more intense version)
  const glowColor = useMemo(() => {
    const hex = moodColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.25)`;
  }, [moodColor]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Tie-dye gradient base */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{
          background: `
            radial-gradient(circle at 20% 30%, ${colorVariations[0]} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${colorVariations[1]} 0%, transparent 45%),
            radial-gradient(circle at 40% 70%, ${colorVariations[2]} 0%, transparent 55%),
            radial-gradient(circle at 70% 80%, ${colorVariations[3]} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, ${colorVariations[4]} 0%, transparent 60%),
            radial-gradient(circle at 90% 60%, ${colorVariations[0]} 0%, transparent 48%),
            radial-gradient(circle at 10% 85%, ${colorVariations[1]} 0%, transparent 52%)
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

      {/* Drifting glow (comet effect) */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-60"
        initial={false}
        animate={{
          x: ["-20%", "120%"],
          y: ["20%", "80%", "10%", "90%", "20%"],
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        }}
        transition={{
          x: {
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          },
          y: {
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          },
          background: {
            duration: 2,
            ease: "easeInOut",
          },
        }}
      />

      {/* Secondary subtle glow for depth */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
        initial={false}
        animate={{
          x: ["100%", "-20%"],
          y: ["80%", "30%", "70%", "40%", "80%"],
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 65%)`,
        }}
        transition={{
          x: {
            duration: 55,
            repeat: Infinity,
            ease: "linear",
          },
          y: {
            duration: 55,
            repeat: Infinity,
            ease: "linear",
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
