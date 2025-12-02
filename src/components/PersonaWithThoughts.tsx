import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BeingCanvas } from "@/components/being/BeingCanvas";
import { RenderState } from "@/consciousness";

interface LogEntry {
  id: string;
  text: string;
  emotion: string;
  color: string;
  timestamp: Date;
}

interface PersonaWithThoughtsProps {
  isThinking: boolean;
  recentWords: string[];
  moodColor: string;
  personaState: string;
  logEntries: LogEntry[];
  isTyping: boolean;
  onClick?: () => void;
  guidance?: string;
}

export const PersonaWithThoughts = ({ isThinking, recentWords, moodColor, personaState, logEntries, isTyping, onClick, guidance }: PersonaWithThoughtsProps) => {
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Derive render state from mood color and typing state
  const renderState: RenderState = useMemo(() => {
    // Parse hue from moodColor (expected format: hsl(H, S%, L%))
    const hueMatch = moodColor.match(/hsl\((\d+)/);
    const hue = hueMatch ? parseInt(hueMatch[1]) : 60;
    
    return {
      coreRadius: isTyping ? 0.8 : 0.6,
      entropyLevel: isTyping ? 0.6 : 0.3,
      colorHue: hue,
      glow: isTyping ? 0.8 : 0.5,
      particleActivity: isTyping ? 0.7 : 0.4,
      connectionDensity: logEntries.length > 0 ? Math.min(logEntries.length * 0.1, 0.8) : 0.3,
    };
  }, [moodColor, isTyping, logEntries.length]);

  useEffect(() => {
    if (recentWords.length > 0) {
      setDisplayWords((prev) => {
        const lastWord = recentWords[recentWords.length - 1];
        
        // Only add if it's a new unique word
        if (!prev.includes(lastWord)) {
          // Keep last 10 unique words
          return [...prev.slice(-9), lastWord];
        }
        
        return prev;
      });
    }
  }, [recentWords]);

  // Removed blink animation - using 3D being instead

  const handleAvatarClick = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 800);
    onClick?.();
  };

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end">
      {/* Guidance Bubble */}
      <AnimatePresence>
        {guidance && !isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="mb-4 relative max-w-xs"
          >
            <div
              className="bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border-2"
              style={{
                borderColor: moodColor,
                boxShadow: `0 0 20px ${moodColor}30`,
              }}
            >
              <p className="text-sm text-foreground/90 italic">{guidance}</p>
            </div>

            {/* Thought bubble tail */}
            <div className="absolute -bottom-2 right-8 flex gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: moodColor, opacity: 0.6 }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: moodColor, opacity: 0.4 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persona Avatar */}
      <motion.div
        animate={{
          scale: isListening ? 1.15 : isTyping ? [1, 1.05, 1] : 1,
          rotateZ: isTyping ? [-2, 2, -2] : 0,
          y: isTyping ? [0, -5, 0] : 0,
        }}
        transition={{
          scale: { 
            duration: isListening ? 0.4 : 1.8, 
            ease: "easeInOut",
            repeat: isTyping ? Infinity : 0,
          },
          rotateZ: { duration: 2, repeat: isTyping ? Infinity : 0, ease: "easeInOut" },
          y: { duration: 2, repeat: isTyping ? Infinity : 0, ease: "easeInOut" },
        }}
        className="relative cursor-pointer"
        onClick={handleAvatarClick}
      >
        <motion.div
          animate={{
            filter: isTyping ? "brightness(1.1)" : isListening ? "brightness(1.4)" : "brightness(1)",
            boxShadow: isTyping 
              ? `0 0 60px ${moodColor}70, 0 0 30px ${moodColor}50, inset 0 0 40px ${moodColor}30`
              : isListening
              ? `0 0 100px ${moodColor}, 0 0 60px ${moodColor}80, inset 0 0 50px ${moodColor}40`
              : `0 0 40px ${moodColor}50, inset 0 0 30px ${moodColor}20`,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-36 h-36 rounded-full overflow-hidden border-4 transition-all duration-700 hover:scale-105"
          style={{
            borderColor: moodColor,
            background: `radial-gradient(circle at center, ${moodColor}15 0%, transparent 70%)`,
          }}
        >
          <BeingCanvas 
            renderState={renderState} 
            className="w-full h-full"
          />
        </motion.div>

        {/* Status indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background"
          style={{ backgroundColor: moodColor }}
        />
      </motion.div>
    </div>
  );
};
