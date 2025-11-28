import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import personaAvatar from "@/assets/persona-avatar.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  onEnterSelectionMode?: () => void;
  isQuestioning?: boolean;
}

export const PersonaWithThoughts = ({
  isThinking,
  recentWords,
  moodColor,
  personaState,
  logEntries,
  isTyping,
  onEnterSelectionMode,
  isQuestioning = false,
}: PersonaWithThoughtsProps) => {
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);

  useEffect(() => {
    if (recentWords.length > 0) {
      const lastWord = recentWords[recentWords.length - 1];
      setDisplayWords((prev) => [...prev.slice(-10), lastWord]);
    }
  }, [recentWords]);

  // Blink animation when not typing
  useEffect(() => {
    if (isTyping) {
      setShouldBlink(false);
      return;
    }

    const blinkInterval = setInterval(
      () => {
        setShouldBlink(true);
        setTimeout(() => setShouldBlink(false), 180);
      },
      3000 + Math.random() * 1500,
    ); // Random between 3-4.5 seconds

    return () => clearInterval(blinkInterval);
  }, [isTyping]);

  const handleAvatarClick = () => {
    setIsListening(true);
    setTimeout(() => setIsListening(false), 800);

    if (onEnterSelectionMode) {
      onEnterSelectionMode();
    } else {
      setIsOpen(true);
    }
  };

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
                        opacity: 1 - (displayWords.length - index - 1) * 0.08,
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
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColor, opacity: 0.6 }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: moodColor, opacity: 0.4 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persona Avatar with Dialog */}
    </div>
  );
};
