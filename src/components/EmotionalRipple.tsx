import { motion, AnimatePresence } from "framer-motion";

interface EmotionalRippleProps {
  isActive: boolean;
  moodColor: string;
}

export const EmotionalRipple = ({ isActive, moodColor }: EmotionalRippleProps) => {
  // Convert hex to rgba with low opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          style={{ zIndex: 0 }}
        >
          {/* Main ripple */}
          <motion.div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${hexToRgba(moodColor, 0.25)} 0%, ${hexToRgba(moodColor, 0.15)} 40%, transparent 70%)`,
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%", opacity: 1 }}
            animate={{ scale: 8, x: "-50%", y: "-50%", opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Secondary ripple for depth */}
          <motion.div
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${hexToRgba(moodColor, 0.2)} 0%, transparent 60%)`,
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%", opacity: 1 }}
            animate={{ scale: 10, x: "-50%", y: "-50%", opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
