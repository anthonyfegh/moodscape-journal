import { motion } from "framer-motion";
import { useMemo } from "react";

interface LivingBackgroundProps {
  moodColor: string;
  isTyping: boolean;
  rippleActive?: boolean;
  intensityMultiplier?: number;
}

export const LivingBackground = ({
  moodColor,
  isTyping,
  rippleActive = false,
  intensityMultiplier = 1.0,
}: LivingBackgroundProps) => {
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

  // Comet glow: saturated, concentrated emotion - reacts to typing
  const cometColors = useMemo(() => {
    const hex = moodColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const boost = (val: number) => {
      const mid = 127;
      return val > mid ? Math.min(val + 80, 255) : Math.max(val - 50, 0);
    };

    const baseIntensity = rippleActive ? 1.3 : isTyping ? 1.15 : 1.0;
    const finalIntensity = baseIntensity * intensityMultiplier;
    const baseOpacity = rippleActive ? 1.0 : isTyping ? 1.0 : 0.85;

    return {
      core: `rgba(${Math.min(boost(r) * finalIntensity, 255)}, ${Math.min(
        boost(g) * finalIntensity,
        255,
      )}, ${Math.min(boost(b) * finalIntensity, 255)}, ${baseOpacity})`,
      middle: `rgba(${Math.min(boost(r) * finalIntensity, 255)}, ${Math.min(
        boost(g) * finalIntensity,
        255,
      )}, ${Math.min(boost(b) * finalIntensity, 255)}, ${isTyping ? 0.65 : 0.55})`,
      outer: `rgba(${r}, ${g}, ${b}, ${isTyping ? 0.35 : 0.25})`,
    };
  }, [moodColor, isTyping, rippleActive, intensityMultiplier]);

  // Animation speeds - boost during ripple and adjust by type intensity
  const speedAdjustment = 1 / intensityMultiplier; // Higher intensity = faster comets
  const mainCometDuration = (rippleActive ? 12 : isTyping ? 18 : 25) * speedAdjustment;
  const secondaryCometDuration = (rippleActive ? 15 : isTyping ? 22 : 30) * speedAdjustment;
  const tertiaryCometDuration = (rippleActive ? 18 : isTyping ? 26 : 34) * speedAdjustment;
  const quaternaryCometDuration = (rippleActive ? 20 : isTyping ? 30 : 40) * speedAdjustment;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background fog */}
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
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ backgroundColor: "hsl(var(--background))" }}
      />

      {/* Comet 1 — Top-left corner */}
      <motion.div
        className="absolute"
        style={{ width: "600px", height: "350px", filter: "blur(35px)" }}
        initial={false}
        animate={{
          x: isTyping ? ["5vw", "45vw", "5vw"] : ["5vw", "15vw", "5vw"],
          y: isTyping ? ["5vh", "45vh", "5vh"] : ["5vh", "15vh", "5vh"],
          scale: isTyping ? [1, 1.08, 1] : 1,
          rotate: [25, 35, 25],
          background: `radial-gradient(ellipse 40% 60% at 30% 50%, ${cometColors.core} 0%, ${cometColors.middle} 40%, ${cometColors.outer} 70%, transparent 100%)`,
        }}
        transition={{
          x: { duration: isTyping ? mainCometDuration : 8, repeat: Infinity, ease: "easeInOut" },
          y: { duration: isTyping ? mainCometDuration : 8, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 2, repeat: isTyping ? Infinity : 0, ease: "easeInOut" },
          rotate: { duration: mainCometDuration, repeat: Infinity, ease: "easeInOut" },
          background: { duration: 1.5, ease: "easeInOut" },
        }}
      />

      {/* Comet 2 — Top-right corner */}
      <motion.div
        className="absolute"
        style={{ width: "500px", height: "300px", filter: "blur(45px)" }}
        initial={false}
        animate={{
          x: isTyping ? ["75vw", "45vw", "75vw"] : ["75vw", "65vw", "75vw"],
          y: isTyping ? ["5vh", "45vh", "5vh"] : ["5vh", "15vh", "5vh"],
          scale: isTyping ? [1, 1.06, 1] : 1,
          rotate: [-20, -30, -20],
          background: `radial-gradient(ellipse 45% 55% at 35% 50%, ${cometColors.core} 0%, ${cometColors.middle} 35%, ${cometColors.outer} 65%, transparent 100%)`,
        }}
        transition={{
          x: { duration: isTyping ? secondaryCometDuration : 9, repeat: Infinity, ease: "easeInOut" },
          y: { duration: isTyping ? secondaryCometDuration : 9, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 1.8, repeat: isTyping ? Infinity : 0, ease: "easeInOut" },
          rotate: { duration: secondaryCometDuration, repeat: Infinity, ease: "easeInOut" },
          background: { duration: 1.5, ease: "easeInOut" },
        }}
      />

      {/* Comet 3 — Bottom-left corner */}
      <motion.div
        className="absolute"
        style={{ width: "500px", height: "300px", filter: "blur(45px)" }}
        initial={false}
        animate={{
          x: isTyping ? ["5vw", "45vw", "5vw"] : ["5vw", "15vw", "5vw"],
          y: isTyping ? ["75vh", "45vh", "75vh"] : ["75vh", "65vh", "75vh"],
          scale: isTyping ? [1, 1.04, 1] : 1,
          rotate: [0, 10, 0],
          opacity: isTyping ? [0.4, 0.7, 0.4] : 0.4,
          background: `radial-gradient(ellipse 45% 55% at 35% 50%, ${cometColors.core} 0%, ${cometColors.middle} 35%, ${cometColors.outer} 65%, transparent 100%)`,
        }}
        transition={{
          x: { duration: isTyping ? tertiaryCometDuration : 10, repeat: Infinity, ease: "easeInOut" },
          y: { duration: isTyping ? tertiaryCometDuration : 10, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: isTyping ? Infinity : 0 },
          rotate: { duration: tertiaryCometDuration, repeat: Infinity },
          scale: { duration: 2.2, repeat: isTyping ? Infinity : 0 },
        }}
      />

      {/* Comet 4 — Bottom-right corner */}
      <motion.div
        className="absolute"
        style={{ width: "600px", height: "350px", filter: "blur(35px)" }}
        initial={false}
        animate={{
          x: isTyping ? ["75vw", "45vw", "75vw"] : ["75vw", "65vw", "75vw"],
          y: isTyping ? ["75vh", "45vh", "75vh"] : ["75vh", "65vh", "75vh"],
          scale: isTyping ? [1, 1.03, 1] : 1,
          rotate: [10, -5, 10],
          opacity: isTyping ? [0.3, 0.6, 0.3] : 0.3,
          background: `radial-gradient(ellipse 40% 60% at 30% 50%, ${cometColors.core} 0%, ${cometColors.middle} 40%, ${cometColors.outer} 70%, transparent 100%)`,
        }}
        transition={{
          x: { duration: isTyping ? quaternaryCometDuration : 11, repeat: Infinity, ease: "easeInOut" },
          y: { duration: isTyping ? quaternaryCometDuration : 11, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3.5, repeat: isTyping ? Infinity : 0 },
          rotate: { duration: quaternaryCometDuration, repeat: Infinity },
          scale: { duration: 2.5, repeat: isTyping ? Infinity : 0 },
        }}
      />
    </div>
  );
};
