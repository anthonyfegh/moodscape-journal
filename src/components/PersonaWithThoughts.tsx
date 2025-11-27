import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import personaAvatar from "@/assets/persona-avatar.png";

interface PersonaWithThoughtsProps {
  isThinking: boolean;
  recentWords: string[];
  moodColor: string;
  personaState: string;
}

export const PersonaWithThoughts = ({ isThinking, recentWords, moodColor, personaState }: PersonaWithThoughtsProps) => {
  const [displayWords, setDisplayWords] = useState<string[]>([]);

  useEffect(() => {
    if (recentWords.length > 0) {
      const lastWord = recentWords[recentWords.length - 1];
      setDisplayWords((prev) => [...prev.slice(-10), lastWord]);
    }
  }, [recentWords]);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end">
      {/* Thought Bubble */}
      <AnimatePresence>
        {isThinking && displayWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="mb-4 relative"
          >
            {/* Thought bubble content */}
            <div
              className="bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-xl max-w-xs border-2"
              style={{
                borderColor: moodColor,
                boxShadow: `0 0 20px ${moodColor}30`,
              }}
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Reading...</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-hidden">
                  {displayWords.map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1 - (displayWords.length - index - 1) * 0.08 
                      }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-light px-2 py-1 rounded-md bg-muted/30"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </div>
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
          scale: isThinking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isThinking ? Infinity : 0,
          repeatType: "reverse",
        }}
        className="relative"
      >
        <div
          className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg transition-all duration-700"
          style={{
            borderColor: moodColor,
            boxShadow: `0 0 30px ${moodColor}40`,
          }}
        >
          <img
            src={personaAvatar}
            alt="Reading Persona"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Status indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background"
          style={{ backgroundColor: moodColor }}
        />
      </motion.div>
    </div>
  );
};
